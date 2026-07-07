Use this as your build prompt:

Build a professional Next.js 14+ operations dashboard for an ECI message-flow observability platform.

Objective:
Create an interactive live topology dashboard that shows the flow:

Kafka → S3Connector Lambda → SQS → PartyEvents Service → SQS → Observer Service → SNS → Multiple SQS Queues → Lambda Consumers

The dashboard must show each component, its relationships, health status, metrics, SLA/SLO status, and anomaly indicators using Dynatrace API, AWS CloudWatch API, and a CSV/config-driven topology model.

Core requirements:

1. Technology Stack

* Next.js 14+ with App Router
* TypeScript
* Tailwind CSS
* React Flow or similar graph/tree visualization library
* Node.js API routes/server actions for backend API calls
* CSV parser library
* Environment-based configuration
* No hardcoded service names in UI

2. Data-Driven Topology
    Create a /config/eci-topology.csv file as the source of truth.

Sample CSV format:

id,name,type,parentId,provider,environment,dynatraceEntityId,cloudwatchNamespace,cloudwatchMetricName,awsRegion,serviceOwner,sloTarget,alertThreshold,description
kafka-topic-1,Kafka Topic: SourceEvents,KAFKA_TOPIC,,Kafka,prod,,,,ca-central-1,Platform Team,99.9,5m,Source Kafka topic
s3connector,S3Connector Lambda,LAMBDA,kafka-topic-1,AWS,prod,FUNCTION-XXXXX,AWS/Lambda,Duration,ca-central-1,ECI Team,99.9,1000ms,Consumes Kafka and sends to SQS
sqs-1,S3Connector Output Queue,SQS,s3connector,AWS,prod,QUEUE-XXXXX,AWS/SQS,ApproximateNumberOfMessagesVisible,ca-central-1,ECI Team,99.9,1000,Queue after S3Connector
partyevents,PartyEvents Service,SERVICE,sqs-1,AWS,prod,SERVICE-XXXXX,builtin:service,ResponseTime,ca-central-1,Party Team,99.9,500ms,Processes party events
sqs-2,Observer Input Queue,SQS,partyevents,AWS,prod,QUEUE-YYYYY,AWS/SQS,ApproximateNumberOfMessagesVisible,ca-central-1,ECI Team,99.9,1000,Queue before observer
observer,Observer Service,SERVICE,sqs-2,AWS,prod,SERVICE-YYYYY,builtin:service,ResponseTime,ca-central-1,Observer Team,99.9,500ms,Observes events and publishes to SNS
sns-1,Observer Event SNS,SNS,observer,AWS,prod,SNS-ZZZZZ,AWS/SNS,NumberOfMessagesPublished,ca-central-1,Observer Team,99.9,1000,SNS topic for fan-out
sqs-payment,Payment Queue,SQS,sns-1,AWS,prod,QUEUE-PAY,AWS/SQS,ApproximateNumberOfMessagesVisible,ca-central-1,Payment Team,99.9,1000,Payment queue
lambda-payment,Payment Lambda,LAMBDA,sqs-payment,AWS,prod,FUNCTION-PAY,AWS/Lambda,Errors,ca-central-1,Payment Team,99.9,1%,Payment event processor
sqs-notification,Notification Queue,SQS,sns-1,AWS,prod,QUEUE-NOTIFY,AWS/SQS,ApproximateNumberOfMessagesVisible,ca-central-1,Notification Team,99.9,1000,Notification queue
lambda-notification,Notification Lambda,LAMBDA,sqs-notification,AWS,prod,FUNCTION-NOTIFY,AWS/Lambda,Errors,ca-central-1,Notification Team,99.9,1%,Notification processor

3. Config File
    Create /config/dashboard.config.ts.

It should include:

* Dynatrace base URL
* Dynatrace API token from environment variable
* AWS region
* Refresh interval
* Severity color mapping
* Metric mappings by component type

Do not expose tokens in frontend code.

4. Environment Variables
    Use .env.local:

DYNATRACE_BASE_URL=https://your-env.live.dynatrace.com
DYNATRACE_API_TOKEN=replace_with_token
AWS_REGION=ca-central-1
TOPOLOGY_CSV_PATH=config/eci-topology.csv

5. Backend API Routes
    Create these API routes:

GET /api/topology
GET /api/metrics/:componentId
GET /api/problems
GET /api/component/:componentId

Responsibilities:

* /api/topology reads the CSV and returns nodes and edges.
* /api/metrics/:componentId fetches Dynatrace and/or CloudWatch metrics for the component.
* /api/problems fetches active Dynatrace problems.
* /api/component/:componentId returns full metadata, current health, SLO, SLA, owner, and links.

6. Dynatrace API Integration
    Create a reusable Dynatrace client.

Functions needed:

* getEntity(entityId)
* getProblems()
* getServiceMetrics(entityId)
* getLambdaMetrics(entityId)
* getSloStatus(entityId)
* getAnomalies(entityId)

Use server-side API calls only.

7. AWS CloudWatch Integration
    Create a reusable CloudWatch client.

Functions needed:

* getSqsMetrics(queueName)
* getLambdaMetrics(functionName)
* getSnsMetrics(topicName)
* getKafkaMetrics(topicName), if available
* getMetricHistory(componentId)

8. UI Layout
    Create a clean enterprise dashboard.

Pages:

* / ECI topology dashboard
* /components/[id] component detail page
* /problems active incidents page
* /slo SLA/SLO overview page

Main dashboard should include:

* Header with environment selector
* Overall health summary cards
* Interactive topology tree/graph
* Active problems panel
* SLA/SLO breach panel
* Recent anomalies panel
* Auto-refresh indicator

9. Topology Visualization
    Use React Flow.

Node types:

* Kafka topic
* Lambda
* SQS
* Service
* SNS
* Database
* External system

Each node should show:

* Name
* Type icon
* Health status
* Current throughput
* Average response time
* Error rate
* SLO status
* Owner

Color coding:

* Green: healthy
* Yellow: warning
* Red: critical
* Gray: unknown/no data

Clicking a node should open a side panel showing:

* Full service name
* Component type
* Owner
* SLA/SLO target
* Current metrics
* Error rate
* Latency
* Throughput
* Queue depth
* Active Dynatrace problems
* Deep link to Dynatrace entity page
* Deep link to CloudWatch logs/metrics

10. Metrics to Display

For Lambda:

* Invocations
* Errors
* Duration average
* Duration p95
* Throttles
* Concurrent executions

For SQS:

* Visible messages
* Oldest message age
* Messages sent
* Messages received
* DLQ count if configured

For SNS:

* Messages published
* Failed notifications
* Number of subscriptions

For Service/API:

* Request count
* Response time average
* P95 response time
* Error rate
* Availability

For Kafka:

* Message rate
* Consumer lag
* Failed messages
* Topic throughput

11. Anomaly Detection
    Show anomaly status based on:

* Dynatrace problems
* Metric value crossing configured threshold
* Sudden traffic spike
* Consumer lag increase
* Queue depth growth
* Lambda error spike
* SLO breach

Each anomaly should show:

* Component name
* Metric breached
* Current value
* Expected/normal value
* Severity
* Start time
* Suggested owner/team

12. Code Quality

* Use TypeScript interfaces for topology nodes, metrics, and problems.
* Keep API integrations separate from UI components.
* Use reusable components.
* Add loading, error, and empty states.
* Never expose API tokens to the browser.
* Make the CSV easily replaceable with actual production service names.
* Add README with setup instructions.

13. Folder Structure

src/
  app/
    page.tsx
    problems/page.tsx
    slo/page.tsx
    components/[id]/page.tsx
    api/
      topology/route.ts
      problems/route.ts
      metrics/[componentId]/route.ts
      component/[componentId]/route.ts
  components/
    dashboard/
      HealthSummaryCards.tsx
      TopologyGraph.tsx
      ComponentSidePanel.tsx
      ProblemsPanel.tsx
      AnomalyPanel.tsx
      SloPanel.tsx
    topology/
      KafkaNode.tsx
      LambdaNode.tsx
      SqsNode.tsx
      SnsNode.tsx
      ServiceNode.tsx
      DatabaseNode.tsx
  lib/
    dynatrace/
      client.ts
      metrics.ts
      problems.ts
      entities.ts
    aws/
      cloudwatchClient.ts
      sqsMetrics.ts
      lambdaMetrics.ts
      snsMetrics.ts
    topology/
      csvReader.ts
      topologyBuilder.ts
      healthCalculator.ts
  config/
    dashboard.config.ts
    eci-topology.csv
  types/
    topology.ts
    metrics.ts
    problems.ts

14. Final Output
    Generate the complete working Next.js project code with:

* CSV-driven topology
* Dynatrace API integration placeholders
* CloudWatch API integration placeholders
* Interactive graph dashboard
* Component drill-down panel
* Health color coding
* SLO/anomaly panels
* Clean professional enterprise UI
* README setup guide

Use mock data fallback if API credentials are not available, but keep the real integration structure ready.

Best approach: first build this with mock data from CSV, then connect Dynatrace, then CloudWatch, then alert routing.