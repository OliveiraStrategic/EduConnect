# EduConnect — Arquitetura do Sistema e Design de Software

Este documento detalha as decisões arquiteturais, a segregação de responsabilidades e as estratégias de escalabilidade adotadas para a plataforma **EduConnect**. A arquitetura foi concebida sob o prisma de manutenibilidade, desacoplamento e capacidade de absorver alta concorrência.

---

## 1. Arquitetura Geral do Sistema

O EduConnect adota um modelo de **Monolito Modular** na camada de backend, projetado para facilitar a transição para **Microserviços** conforme a carga de dados e o volume de requisições escalem. A aplicação opera de maneira **Stateless (Sem Estado)** na camada da API, permitindo escalabilidade horizontal imediata.

```
+-----------------------------------------------------------------------+
|                       Camada de Apresentação (React)                  |
+-----------------------------------------------------------------------+
                                   | (HTTPS / JSON Web Token)
                                   v
+-----------------------------------------------------------------------+
|                    Nginx (Load Balancer / Reverse Proxy)               |
+-----------------------------------------------------------------------+
                                   | (Round Robin / Least Connections)
                                   v
+-----------------------------------------------------------------------+
|                   API Backend stateless (Node.js/Express)              |
+-----------------------------------------------------------------------+
         | (Leitura Rápida)                           | (Leitura / Escrita ACID)
         v                                            v
+------------------+                        +---------------------------+
| Cache (Redis)    |                        | PostgreSQL (Master/Slave) |
+------------------+                        +---------------------------+
```

---

## 2. Separação de Camadas (Padrão de Design)

Para garantir o princípio de responsabilidade única (SRP) e alta testabilidade, o backend em Node.js é segmentado em três camadas lógicas estritas:

```
[Cliente HTTP] 
      |
      v
[Controller] <--- Valida inputs HTTP, trata requests e formata responses
      |
      v
[Service]    <--- Contém a lógica de negócio e regras operacionais (Domain logic)
      |
      v
[Repository] <--- Abstrai o acesso aos dados físicos (SQL PostgreSQL)
      |
      v
[PostgreSQL / Redis]
```

### 1. Controllers (Camada de Transporte e Apresentação HTTP)
* Recebem a requisição do roteador Express.
* Efetuam validações básicas de sintaxe nos dados recebidos (corpo da requisição, parâmetros e query strings).
* Invocam a camada de **Service** correspondente para processar as regras de negócio.
* Traduzem os retornos da camada de serviço em respostas HTTP estruturadas (Códigos HTTP e formatos JSON).

### 2. Services (Camada de Regras de Negócio / Domínio)
* Representam o núcleo funcional da aplicação.
* Orquestram fluxos de dados complexos, cálculos acadêmicos (ex: média de notas) e validações operacionais de regras de negócio (RNs).
* Não possuem conhecimento sobre a camada de transporte (HTTP ou protocolo de rede) e não realizam queries SQL brutas.
* Invocam a camada de **Repository** para ler e persistir dados.

### 3. Repositories (Camada de Abstração de Acesso a Dados)
* Isolam as chamadas físicas de persistência.
* Contêm o código SQL nativo para interagir com o PostgreSQL.
* Fornecem uma interface de métodos abstratos (ex: `findById`, `create`) para as camadas superiores.
* Previnem o acoplamento do código de negócio com o dialeto de banco de dados específico.

---

## 3. Fluxo de Requisição Completo

Para ilustrar o ciclo de vida de uma requisição típica (ex: alteração de nota de aluno):

1. **Client (React):** Envia um request `PUT /api/grades/:id` contendo a nova nota no corpo do JSON e o token JWT no cabeçalho `Authorization`.
2. **Reverse Proxy (Nginx):** Recebe o tráfego externo HTTPS, decodifica a camada SSL/TLS e repassa a requisição HTTP pura para um dos nós de API disponíveis.
3. **Router & Middlewares (Express):**
   * O middleware de autenticação (`auth.middleware.js`) intercepta a requisição, valida a integridade do JWT utilizando a chave secreta e verifica se o usuário autenticado possui o papel correspondente (`professor` ou `admin`).
   * Adiciona os metadados do usuário autenticado no objeto `req.user`.
4. **Grade Controller:** Recebe a chamada da rota mapeada, extrai os parâmetros `id` e a nota informada, validando se são numéricos coerentes, e invoca `GradeService.updateGrade(id, note, req.user.id)`.
5. **Grade Service:**
   * Valida se a nota está no intervalo permitido (0 a 10).
   * Consulta o repositório para verificar se o prazo limite de alteração retroativa (Regra de Negócio RN04) não expirou.
   * Solicita ao repositório a atualização da nota.
   * Cria uma tarefa assíncrona para registrar o log de auditoria no banco e enviar uma notificação para o aluno.
6. **Grade Repository:** Executa a transação `UPDATE grades SET note = $1, updated_at = NOW() WHERE id = $2` usando o pool de conexões com o PostgreSQL.
7. **Client Response:** O controller recebe a confirmação do service e retorna o status `200 OK` com os novos dados da avaliação no corpo da resposta.

---

## 4. Estratégia de Escalabilidade

Para suportar grandes volumes de dados e picos repentinos de requisições, o EduConnect adota quatro pilares de escalabilidade:

### 1. APIs 100% Stateless
* Nenhum estado de sessão do usuário é mantido em memória RAM na aplicação Node.js.
* Todas as informações de contexto do usuário são criptografadas dentro das claims do **JSON Web Token (JWT)** enviado pelo cliente em cada requisição.
* Facilita a adição ou remoção dinâmica de nós de backend sem quebras de sessão.

### 2. Clusterização com Node.js
* Por padrão, o Node.js roda sob uma arquitetura de thread única (single-thread event loop).
* Em ambientes produtivos multinúcleos (multi-core), o EduConnect utiliza o gerenciador de processos **PM2** configurado em modo cluster, ou instâncias independentes em contêineres Docker orquestrados.
* Spawna um processo de execução por núcleo de CPU físico da máquina de hospedagem, maximizando o aproveitamento do hardware.

### 3. Balanceamento de Carga (Load Balancing)
* Um servidor **Nginx** é posicionado na borda da infraestrutura backend, atuando como proxy reverso e balanceador de carga.
* Distribui as requisições recebidas entre os nós do cluster de forma balanceada (algoritmo Round Robin ou Least Connections).
* Realiza checagem ativa de saúde (*health checks*) para desviar tráfego de nós corrompidos.

---

## 5. Estratégia de Cache com Redis

Para mitigar a concorrência excessiva e gargalos de I/O no banco relacional PostgreSQL, o EduConnect incorpora o **Redis** como camada de cache distribuído em memória.

### Cenários de Aplicação
* **Cache de Grade Curricular e Disciplinas:** Dados estáticos e de baixa volatilidade são consultados no Redis. O cache é invalidado apenas quando ocorrem alterações na secretaria acadêmica.
* **Cache de Boletins:** Durante o período de fechamento de notas, os boletins gerados são cacheados com tempo de expiração curto (ex: 5 minutos), evitando queries redundantes de agregação no PostgreSQL.
* **Blocklist de Tokens JWT:** Em cenários de deslogamento prematuro (*logout*) ou redefinição de senhas, os IDs dos tokens JWT invalidados são gravados temporariamente no Redis até expirarem naturalmente.

---

## 6. Segurança e Autenticação

A arquitetura de segurança é implementada de forma rigorosa em todas as frentes:

* **Validação de Assinatura JWT:** Todo recurso protegido exige um token JWT assinado por algoritmo HS256 utilizando uma chave secreta de alta entropia.
* **Prevenção de SQL Injection:** A camada de Repository utiliza **Prepared Statements / Queries Parametrizadas** fornecidas nativamente pelo driver `pg`. Nenhuma query é montada por concatenação direta de strings informadas pelo usuário.
* **Criptografia de Senhas:** O armazenamento de senhas é protegido pelo algoritmo adaptativo **bcrypt** com fator de custo 12, tornando inviável engenharia reversa por ataques de dicionário ou tabelas arco-íris (*rainbow tables*).
