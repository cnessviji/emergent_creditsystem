Use this Dynatrace-only prompt:

Build a professional Next.js 14+ ECI observability dashboard using only Dynatrace API v2.

Objective:
Create an interactive live topology dashboard for this ECI flow:

Kafka → S3Connector Lambda → SQS → PartyEvents Service → SQS → Observer Service → SNS → Multiple SQS Queues → Lambda Consumers

The dashboard must read the topology from a CSV file and use Dynatrace API v2 to fetch service health, metrics, problems, anomalies, SLA/SLO status, and entity details.

Do not use AWS CloudWatch APIs.

Technology Stack:

* Next.js 14+ App Router
* TypeScript
* Tailwind CSS
* React Flow
* CSV parser
* Server-side API routes
* Dynatrace API v2 only
* Environment variables for secrets

Environment variables:

DYNATRACE_BASE_URL=https://your-env.live.dynatrace.com
DYNATRACE_API_TOKEN=replace_with_token
TOPOLOGY_CSV_PATH=config/eci-topology.csv
REFRESH_INTERVAL_SECONDS=60

CSV file:

id,name,type,parentId,dynatraceEntityId,metricKeys,serviceOwner,sloTarget,alertThreshold,description
kafka-topic-1,Kafka Topic: SourceEvents,KAFKA_TOPIC,,CUSTOM_DEVICE-XXXXX,builtin:cloud.kafka.producer.bytes,builtin:cloud.kafka.consumer.lag,Platform Team,99.9,5m,Source Kafka topic
s3connector,S3Connector Lambda,LAMBDA,kafka-topic-1,CLOUD_APPLICATION_INSTANCE-XXXXX,builtin:cloud.aws.lambda.invocations,builtin:cloud.aws.lambda.errors,builtin:cloud.aws.lambda.duration,ECI Team,99.9,1000ms,Consumes Kafka and sends to SQS
sqs-1,S3Connector Output Queue,SQS,s3connector,CUSTOM_DEVICE-QUEUE1,builtin:cloud.aws.sqs.number_of_messages_sent,builtin:cloud.aws.sqs.approximate_number_of_messages_visible,ECI Team,99.9,1000,Queue after S3Connector
partyevents,PartyEvents Service,SERVICE,sqs-1,SERVICE-XXXXX,builtin:service.requestCount.total,builtin:service.response.time,builtin:service.errors.total.count,Party Team,99.9,500ms,Processes party events
sqs-2,Observer Input Queue,SQS,partyevents,CUSTOM_DEVICE-QUEUE2,builtin:cloud.aws.sqs.number_of_messages_sent,builtin:cloud.aws.sqs.approximate_number_of_messages_visible,ECI Team,99.9,1000,Queue before observer
observer,Observer Service,SERVICE,sqs-2,SERVICE-YYYYY,builtin:service.requestCount.total,builtin:service.response.time,builtin:service.errors.total.count,Observer Team,99.9,500ms,Observes events and publishes to SNS
sns-1,Observer Event SNS,SNS,observer,CUSTOM_DEVICE-SNS1,builtin:cloud.aws.sns.number_of_messages_published,builtin:cloud.aws.sns.number_of_notifications_failed,Observer Team,99.9,1000,SNS topic for fan-out
sqs-payment,Payment Queue,SQS,sns-1,CUSTOM_DEVICE-PAYQUEUE,builtin:cloud.aws.sqs.approximate_number_of_messages_visible,builtin:cloud.aws.sqs.approximate_age_of_oldest_message,Payment Team,99.9,1000,Payment queue
lambda-payment,Payment Lambda,LAMBDA,sqs-payment,CLOUD_APPLICATION_INSTANCE-PAY,builtin:cloud.aws.lambda.invocations,builtin:cloud.aws.lambda.errors,builtin:cloud.aws.lambda.duration,Payment Team,99.9,1%,Payment event processor

Important:

* Do not hardcode service names in the UI.
* Every node must come from the CSV.
* Every metric key must come from the CSV.
* If a metric is not available in Dynatrace, show “No data” instead of failing.
* If Dynatrace API credentials are missing, use mock data.

Required Dynatrace API v2 integrations:

1. Entity API

Use:

GET /api/v2/entities/{entityId}

Purpose:

* Fetch entity display name
* Fetch entity type
* Fetch tags
* Fetch management zones
* Fetch relationships if available

2. Problems API

Use:

GET /api/v2/problems

Purpose:

* Fetch active problems
* Match problems to topology nodes by affected entity ID
* Show severity and impact

3. Metrics API

Use:

GET /api/v2/metrics/query

Purpose:

* Query metric values for each topology node
* Use metric keys from the CSV
* Filter by Dynatrace entity ID where supported

Example query format:

/api/v2/metrics/query?metricSelector=builtin:service.response.time:splitBy():avg&entitySelector=entityId("SERVICE-XXXXX")&from=now-1h

4. SLO API

Use:

GET /api/v2/slo

Purpose:

* Fetch SLOs
* Match SLOs to service/entity where possible
* Display current SLO status and target

Backend API routes to create:

GET /api/topology
GET /api/component/[componentId]
GET /api/metrics/[componentId]
GET /api/problems
GET /api/slo

Backend behavior:

* /api/topology reads CSV and returns nodes and edges.
* /api/component/[componentId] returns CSV metadata + Dynatrace entity details + active problems + latest metrics.
* /api/metrics/[componentId] reads metric keys from CSV and queries Dynatrace API v2.
* /api/problems returns active Dynatrace problems mapped to topology components.
* /api/slo returns SLO status mapped to components where possible.

UI pages:

/                      Main ECI topology dashboard
/components/[id]       Component detail page
/problems              Active problems page
/slo                   SLO overview page

Main dashboard requirements:

* Show ECI topology using React Flow.
* Use parentId from CSV to draw edges.
* Show each node with:
    * Component name
    * Component type
    * Health color
    * Owner
    * Key metric summary
    * Active problem indicator
    * SLO status
* Clicking a node opens a side panel.
* Side panel shows:
    * Full component details
    * Dynatrace entity ID
    * Owner
    * Description
    * Metrics
    * Active problems
    * SLO target
    * Current SLO status
    * Deep link to Dynatrace entity page

Health calculation:

* Red if there is an active critical Dynatrace problem.
* Yellow if warning problem exists.
* Yellow if SLO is below target.
* Yellow if any metric crosses alertThreshold from CSV.
* Green if healthy.
* Gray if no data.

Dashboard panels:

* Overall platform health
* Total components
* Components healthy/warning/critical
* Active Dynatrace problems
* SLA/SLO breaches
* Recent anomalies
* Topology graph

Metrics display by type:

For SERVICE:

* request count
* response time
* error count
* error rate if calculable

For LAMBDA:

* invocations
* errors
* duration
* throttles if available

For SQS:

* visible messages
* sent messages
* received messages
* oldest message age if available

For SNS:

* messages published
* failed notifications
* delivered notifications if available

For KAFKA_TOPIC:

* message rate
* producer throughput
* consumer lag if available

Folder structure:

src/
  app/
    page.tsx
    problems/page.tsx
    slo/page.tsx
    components/[id]/page.tsx
    api/
      topology/route.ts
      component/[componentId]/route.ts
      metrics/[componentId]/route.ts
      problems/route.ts
      slo/route.ts
  components/
    dashboard/
      HealthSummaryCards.tsx
      TopologyGraph.tsx
      ComponentSidePanel.tsx
      ProblemsPanel.tsx
      SloPanel.tsx
      AnomalyPanel.tsx
    topology/
      TopologyNode.tsx
      KafkaNode.tsx
      LambdaNode.tsx
      SqsNode.tsx
      SnsNode.tsx
      ServiceNode.tsx
  lib/
    dynatrace/
      client.ts
      entities.ts
      metrics.ts
      problems.ts
      slo.ts
    topology/
      csvReader.ts
      topologyBuilder.ts
      healthCalculator.ts
      metricMapper.ts
  config/
    eci-topology.csv
    dashboard.config.ts
  types/
    topology.ts
    metrics.ts
    problems.ts
    slo.ts

Dynatrace client requirements:

* Centralize the base URL and token.
* Never expose token to frontend.
* Handle API failures gracefully.
* Add timeout handling.
* Return mock data if credentials are missing.
* Log errors server-side only.

Example Dynatrace client:

const dynatraceFetch = async (path: string) => {
  const baseUrl = process.env.DYNATRACE_BASE_URL;
  const token = process.env.DYNATRACE_API_TOKEN;
  if (!baseUrl || !token) {
    throw new Error("Dynatrace configuration missing");
  }
  const response = await fetch(`${baseUrl}${path}`, {
    headers: {
      Authorization: `Api-Token ${token}`,
      Accept: "application/json"
    },
    cache: "no-store"
  });
  if (!response.ok) {
    throw new Error(`Dynatrace API failed: ${response.status}`);
  }
  return response.json();
};

UI design:

* Enterprise-grade dashboard
* Dark/light mode support
* Clean card-based layout
* React Flow topology in the center
* Right-side component detail drawer
* Top health summary cards
* Status colors: green, yellow, red, gray
* Auto refresh every 60 seconds
* Search/filter by component name, type, owner, health

Final deliverable:
Generate the complete working Next.js project code with Dynatrace API v2 integration only, CSV-driven topology, mock fallback, React Flow topology graph, component drilldown, problem mapping, SLO display, and professional dashboard UI.