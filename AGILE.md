# AI-Based Intrusion Detection & Adaptive Network Defense System

## Agile Software Development Documentation

### 1. Project Overview

The project follows the Agile Software Development methodology.
The system is developed incrementally through multiple sprints, with
continuous testing, integration, and improvement.

The main objective is to develop a software-only AI-based system that can
detect network intrusions, classify attacks, and perform adaptive defensive
actions.

---

## 2. Product Backlog

| ID | User Story / Feature | Priority |
|----|----------------------|----------|
| US01 | As a user, I want to load network traffic data so that it can be analyzed. | High |
| US02 | As a system, I want to preprocess network traffic data so that ML can use it. | High |
| US03 | As a system, I want to detect malicious traffic using Machine Learning. | High |
| US04 | As a system, I want to classify detected attacks such as DDoS and PortScan. | High |
| US05 | As a security system, I want to generate defensive actions for detected attacks. | High |
| US06 | As a user, I want to view security events through a dashboard. | High |
| US07 | As a developer, I want automated tests to verify system functionality. | High |
| US08 | As a developer, I want Docker deployment for easy execution. | Medium |
| US09 | As a developer, I want Prometheus and Grafana monitoring. | Medium |
| US10 | As a team, we want CI/CD testing through GitHub Actions. | Medium |
| US11 | As a user, I want security logs to be stored for later analysis. | Medium |
| US12 | As a user, I want the system to show normal and malicious traffic statistics. | Medium |

---

# 3. Sprint Planning

## Sprint 1 – Project Planning and Dataset Preparation

### Goal
Prepare the project structure and network intrusion dataset.

### Activities
- Define project objectives.
- Select CICIDS2017 dataset.
- Analyze network traffic features.
- Clean missing and invalid values.
- Separate benign and attack traffic.
- Create the initial project structure.

### Deliverables
- Cleaned dataset.
- Project architecture.
- Initial GitHub repository.

---

## Sprint 2 – Machine Learning Model

### Goal
Develop and evaluate the intrusion detection model.

### Activities
- Perform feature selection.
- Split data into training and testing sets.
- Train Random Forest classifier.
- Evaluate model accuracy, precision, recall and F1-score.
- Generate confusion matrix.
- Identify important network traffic features.
- Save the trained model.

### Deliverables
- Trained ML model.
- Selected feature list.
- Evaluation graphs.
- Saved `.pkl` model files.

---

## Sprint 3 – Intrusion Detection API

### Goal
Integrate the ML model into a Flask application.

### Activities
- Create Flask backend.
- Load trained ML model.
- Create prediction API.
- Accept network traffic features.
- Generate intrusion predictions.
- Return prediction results through JSON.
- Create security logging functionality.

### Deliverables
- Flask application.
- `/predict` API.
- `/api/status` API.
- Security logs.

---

## Sprint 4 – Adaptive Network Defense

### Goal
Implement automatic responses to detected threats.

### Activities
- Detect benign traffic.
- Detect malicious traffic.
- Generate ALLOW action for normal traffic.
- Generate BLOCK action for DDoS attacks.
- Generate ALERT action for other attacks.
- Store defensive actions in security logs.
- Test defensive responses.

### Deliverables
- Adaptive defense module.
- Security event logging.
- Automated defense tests.

---

## Sprint 5 – Dashboard and Monitoring

### Goal
Provide real-time visibility into system activity.

### Activities
- Develop web dashboard.
- Display total predictions.
- Display detected threats.
- Display blocked attacks.
- Display normal traffic.
- Display security logs.
- Integrate Prometheus monitoring.
- Integrate Grafana dashboard.

### Deliverables
- Security dashboard.
- Prometheus metrics.
- Grafana monitoring dashboard.

---

## Sprint 6 – DevOps, Testing and Deployment

### Goal
Automate testing and deploy the complete application.

### Activities
- Create Dockerfile.
- Configure Docker Compose.
- Create automated pytest tests.
- Configure GitHub Actions.
- Run tests automatically on push.
- Verify application deployment.
- Perform final integration testing.

### Deliverables
- Docker deployment.
- Automated test suite.
- GitHub Actions CI pipeline.
- Final integrated system.

---

# 4. User Stories

### User Story 1 – Intrusion Detection

**As a security administrator, I want the system to analyze network
traffic so that malicious traffic can be detected automatically.**

### User Story 2 – Attack Classification

**As a security administrator, I want detected attacks to be classified
so that appropriate defensive actions can be selected.**

### User Story 3 – Adaptive Defense

**As a security system, I want to automatically respond to detected
attacks so that malicious traffic can be controlled.**

### User Story 4 – Security Dashboard

**As a security administrator, I want a dashboard showing security
statistics so that I can monitor network activity easily.**

### User Story 5 – Monitoring

**As a system administrator, I want Prometheus and Grafana monitoring
so that system activity can be observed over time.**

### User Story 6 – Automated Testing

**As a developer, I want automated tests to run whenever code is pushed
so that software errors can be detected early.**

---

# 5. Daily Stand-up

The development team follows three questions during daily stand-ups:

1. What was completed yesterday?
2. What will be completed today?
3. Are there any problems or blockers?

### Example

**Yesterday:**
- Completed ML model integration.

**Today:**
- Implement adaptive defense responses.

**Blockers:**
- No major blockers.

---

# 6. Definition of Done

A feature is considered complete when:

- The feature is implemented.
- The code executes successfully.
- Required tests are passed.
- Errors are handled properly.
- The feature is integrated with the main application.
- Documentation is updated.
- Changes are committed to Git.
- Changes are pushed to GitHub.

---

# 7. Testing Strategy

The project uses multiple levels of testing:

### Unit Testing
Individual modules such as adaptive defense are tested independently.

### API Testing
Flask API endpoints are tested to verify correct responses.

### Integration Testing
ML prediction, adaptive defense, logging and dashboard components
are tested together.

### Automated Testing
Pytest tests are executed automatically through GitHub Actions.

### Deployment Testing
The application is tested inside Docker containers.

---

# 8. Agile Retrospective

At the end of each sprint, the team reviews:

### What went well?
- ML model achieved high classification performance.
- Flask API was successfully integrated.
- Adaptive defense functionality was implemented.
- Docker deployment was completed.
- Monitoring was integrated using Prometheus and Grafana.
- Automated testing was implemented.

### What could be improved?
- Improve real-time traffic capture.
- Support additional attack types.
- Improve dashboard visualizations.
- Improve response automation.
- Add more comprehensive security testing.

### Action Items
- Expand attack classification.
- Improve real-time monitoring.
- Add additional automated tests.
- Improve documentation and deployment automation.

---

# 9. Agile Tools Used

| Tool | Purpose |
|------|---------|
| Git | Version control |
| GitHub | Source code management |
| GitHub Actions | CI/CD automation |
| VS Code | Development |
| Docker | Application containerization |
| Docker Compose | Multi-container deployment |
| Pytest | Automated testing |
| Prometheus | Metrics monitoring |
| Grafana | Monitoring dashboard |

---

# 10. Project Outcome

The Agile development process helped the team develop the AI-Based
Intrusion Detection and Adaptive Network Defense System incrementally.

The final system combines Machine Learning, Computer Networks,
DevOps and Agile Software Development concepts into a single
software-based cybersecurity solution.