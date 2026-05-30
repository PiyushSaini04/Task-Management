pipeline {
    agent any

    options {
        timeout(time: 30, unit: 'MINUTES')
        buildDiscarder(logRotator(numToKeepStr: '10'))
        ansiColor('xterm')
        timestamps()
    }

    environment {
        COMPOSE_FILE = 'docker-compose.yml'
        COMPOSE_PROJECT_NAME = 'taskmanager'
        BACKEND_DIR = 'backend'
        FRONTEND_DIR = 'frontend'
        NODE_VERSION = '20'
        PYTHON_VERSION = '3.11'
    }

    stages {
        stage('Checkout') {
            steps {
                echo "Branch: ${env.GIT_BRANCH}"
                echo "Commit: ${env.GIT_COMMIT}"
                echo "Workspace: ${env.WORKSPACE}"
            }
        }

        stage('Setup Environment') {
            steps {
                script {
                    if (!fileExists('.env')) {
                        sh 'cp .env.example .env'
                        echo 'Created .env from .env.example'
                    } else {
                        echo 'Using existing .env file'
                    }
                }
            }
        }

        stage('Lint Frontend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('frontend') {
                        sh 'npm ci'
                        sh 'npm run lint'
                    }
                }
            }
        }

        stage('Lint Backend') {
            steps {
                catchError(buildResult: 'UNSTABLE', stageResult: 'FAILURE') {
                    dir('backend') {
                        sh 'python3 -m venv .venv'
                        sh 'source .venv/bin/activate && pip install flake8'
                        sh 'source .venv/bin/activate && flake8 app --max-line-length=120'
                    }
                }
            }
        }

        stage('Build Docker Images') {
            steps {
                sh """
                    docker compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} build --no-cache
                """
                echo 'Docker images built successfully.'
            }
        }

        stage('Start Services') {
            steps {
                sh """
                    docker compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} up -d db backend frontend nginx
                """
                sh 'sleep 45'
            }
        }

        stage('Health Checks') {
            steps {
                sh """
                    set -a
                    source .env
                    set +a

                    docker compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} exec -T db \\
                      pg_isready -U \${POSTGRES_USER} -d \${POSTGRES_DB}

                    curl --fail --retry 5 --retry-delay 5 \\
                      http://localhost/api/v1/health

                    curl --fail --retry 3 --retry-delay 3 \\
                      http://localhost/
                """
            }
        }

        stage('Smoke Tests') {
            steps {
                sh '''
                    CREATE_STATUS=$(curl -s -o /tmp/create_response.json -w "%{http_code}" \
                      -X POST -H "Content-Type: application/json" \
                      -d '{"title": "Jenkins Smoke Test", "description": "Automated test from Jenkins pipeline"}' \
                      http://localhost/api/v1/tasks)
                    echo "Create status: ${CREATE_STATUS}"
                    if [ "${CREATE_STATUS}" -ne 201 ]; then
                      cat /tmp/create_response.json
                      exit 1
                    fi

                    LIST_STATUS=$(curl -s -o /tmp/response.json -w "%{http_code}" \
                      http://localhost/api/v1/tasks)
                    echo "List status: ${LIST_STATUS}"
                    if [ "${LIST_STATUS}" -ne 200 ]; then
                      cat /tmp/response.json
                      exit 1
                    fi
                    if ! grep -q "Jenkins Smoke Test" /tmp/response.json; then
                      echo "Created task not found in list response"
                      cat /tmp/response.json
                      exit 1
                    fi

                    TASK_ID=$(python3 -c "import json; print(json.load(open('/tmp/create_response.json'))['id'])")

                    UPDATE_STATUS=$(curl -s -o /tmp/response.json -w "%{http_code}" \
                      -X PUT -H "Content-Type: application/json" \
                      -d '{"status": "completed"}' \
                      http://localhost/api/v1/tasks/${TASK_ID})
                    echo "Update status: ${UPDATE_STATUS}"
                    if [ "${UPDATE_STATUS}" -ne 200 ]; then
                      cat /tmp/response.json
                      exit 1
                    fi

                    DELETE_STATUS=$(curl -s -o /tmp/response.json -w "%{http_code}" \
                      -X DELETE \
                      http://localhost/api/v1/tasks/${TASK_ID})
                    echo "Delete status: ${DELETE_STATUS}"
                    if [ "${DELETE_STATUS}" -ne 204 ]; then
                      cat /tmp/response.json
                      exit 1
                    fi

                    echo "All smoke tests passed!"
                '''
            }
        }

        stage('Cleanup') {
            when {
                not { branch 'main' }
            }
            steps {
                sh """
                    docker compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} down -v --remove-orphans
                """
            }
        }
    }

    post {
        always {
            echo "Pipeline finished — Branch: ${env.GIT_BRANCH}, Build: ${env.BUILD_NUMBER}"
            sh 'docker image prune -f || true'
        }
        success {
            echo 'BUILD SUCCEEDED — All stages passed.'
        }
        unstable {
            echo 'BUILD UNSTABLE — Lint warnings detected. Review the linting stages.'
        }
        failure {
            echo 'BUILD FAILED — Check logs above for details.'
            sh """
                docker compose -f ${COMPOSE_FILE} -p ${COMPOSE_PROJECT_NAME} \
                  down --remove-orphans || true
            """
        }
        cleanup {
            cleanWs()
        }
    }
}
