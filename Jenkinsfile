pipeline {
    agent any
    environment {
        DOCKER_HUB_CREDENTIALS = credentials('docker-hub-credentials')
        BE_IMAGE = "${DOCKER_HUB_CREDENTIALS}/zalo_clone-backend"
        FE_IMAGE = "${DOCKER_HUB_CREDENTIALS}/zalo_clone-frontend"
        DOCKER_TAG = "1"
        AWS_REGION = "ap-southeast-1"
        EB_APPLICATION_NAME = "zalo-app-be"
        EB_ENVIRONMENT_NAME = "ZaloAppBe-env"
        S3_BUCKET = "your-s3-bucket"
    }
    tools {
        maven 'Maven'
        jdk 'JDK17'
        nodejs 'NodeJS'
    }
    stages {
        stage('Checkout') {
            steps {
                git url: 'https://github.com/luongtandat0512/Zalo_Clone', branch: 'TanNha', credentialsId: 'github-credentials'
            }
        }
        stage('Build BE') {
            steps {
                dir('Zalo_App_BE') {
                    sh 'mvn clean package -DskipTests'
                }
            }
        }
        stage('Test BE') {
            steps {
                dir('Zalo_App_BE') {
                    sh 'mvn test'
                }
            }
        }
        stage('Build FE') {
            steps {
                dir('Zalo_Clone_FE') {
                    sh 'rm -rf node_modules package-lock.json'
                    sh 'npm install'
                    sh 'npm run build'
                }
            }
        }
        stage('Build Docker BE') {
            steps {
                dir('Zalo_App_BE') {
                    withCredentials([usernamePassword(credentialsId: 'docker-hub', usernameVariable: 'DOCKER_USERNAME', passwordVariable: 'DOCKER_PASSWORD')]) {
                script {
                    def imageTag = "${DOCKER_USERNAME}/zalo_clone-backend:${DOCKER_TAG}"
                    sh """
                        echo "${DOCKER_PASSWORD}" | docker login -u "${DOCKER_USERNAME}" --password-stdin
                        docker build -t ${imageTag} .
                        docker push ${imageTag}
                    """
                }
            }s
                }
            }
        }
        stage('Build Docker FE') {
            steps {
                dir('Zalo_Clone_FE') {
                    sh "docker build -t ${FE_IMAGE}:${DOCKER_TAG} ."
                }
            }
        }
        stage('Push Docker Images') {
            steps {
                sh 'echo $DOCKER_HUB_CREDENTIALS_PSW | docker login -u $DOCKER_HUB_CREDENTIALS_USR --password-stdin'
                sh "docker push ${BE_IMAGE}:${DOCKER_TAG}"
                sh "docker push ${FE_IMAGE}:${DOCKER_TAG}"
            }
        }
        stage('Deploy BE to Elastic Beanstalk') {
            steps {
                dir('Zalo_App_BE') {
                    script {
                        // Tạo Dockerrun.aws.json
                        writeFile file: 'Dockerrun.aws.json', text: """
                        {
                            "AWSEBDockerrunVersion": "1",
                            "Image": {
                                "Name": "${BE_IMAGE}:${DOCKER_TAG}",
                                "Update": "true"
                            },
                            "Ports": [
                                {
                                    "ContainerPort": 8080,
                                    "HostPort": 8080
                                }
                            ]
                        }
                        """
                        // Nén file triển khai
                        sh 'zip -r zalo-app-be-deploy.zip Dockerrun.aws.json'
                        // Đẩy lên S3 và triển khai
                        sh """
                        aws s3 cp zalo-app-be-deploy.zip s3://${S3_BUCKET}/zalo-app-be-deploy-${DOCKER_TAG}.zip
                        aws elasticbeanstalk create-application-version \
                            --application-name ${EB_APPLICATION_NAME} \
                            --version-label ${DOCKER_TAG} \
                            --source-bundle S3Bucket="${S3_BUCKET}",S3Key="zalo-app-be-deploy-${DOCKER_TAG}.zip" \
                            --region ${AWS_REGION}
                        aws elasticbeanstalk update-environment \
                            --environment-name ${EB_ENVIRONMENT_NAME} \
                            --version-label ${DOCKER_TAG} \
                            --region ${AWS_REGION}
                        """
                    }
                dir('Zalo_Clone_FE') {
                    sh 'zip -r zalo-app-fe-deploy.zip Dockerrun.aws.json'
                    // Đẩy lên S3 và triển khai
                    sh """
                    aws s3 cp zalo-app-fe-deploy.zip s3://${S3_BUCKET}/zalo-app-fe-deploy-${DOCKER_TAG}.zip
                    aws elasticbeanstalk create-application-version \
                        --application-name ${EB_APPLICATION_NAME} \
                        --version-label ${DOCKER_TAG} \
                        --source-bundle S3Bucket="${S3_BUCKET}",S3Key="zalo-app-fe-deploy-${DOCKER_TAG}.zip" \
                        --region ${AWS_REGION}
                    aws elasticbeanstalk update-environment \
                        --environment-name ${EB_ENVIRONMENT_NAME} \
                        --version-label ${DOCKER_TAG} \
                        --region ${AWS_REGION}
                    """
                    }
                }
            }
        }
    }
    post {
        always {
            sh 'docker logout'
            cleanWs()
        }
        success {
            echo "Build #${env.BUILD_NUMBER} succeeded"
        }
        failure {
            echo "Build #${env.BUILD_NUMBER} failed"
        }
    }
}