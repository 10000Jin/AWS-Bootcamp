# Flappy-Bird on AWS ![Flappy Bird](img/favicon.png) 

> Flappy Bird는 클릭으로 새의 높이를 조절해 파이프와 땅에 부딪히지 않고 최대한 멀리 날아가는 게임. 파이프 사이를 통과할 때마다 1점 획득.   
> AWS 클라우드 상에서 Flappy Bird와 Amazon RDS(Database)를 연동해 점수판 기능을 추가하였고 인스턴스 ID 출력 기능(미완성)을 추가.   
> Auto Scaling으로 트래픽에 인스턴스를 탄력적으로 확장 및 축소하도록 하고 DB의 Multi-AZ 배포로 고가용성을 실현. 
> 또한 AWS의 Lambda, CodeDeploy 등으로 CI/CD 파이프 라인을 구축하여 배포를 자동화.
- Flappy Brid GitHub : https://github.com/IgorRozani/flappy-bird

<br>
<p align="center"><img src="img\display.png" width="90%"><br/>Screen Shot</p>
<br>

## Table of Contents
- [How to use](#how-to-use)
- [3-Tier Architecture](#3-tier-architecture)
- [Cloud Architecture](#cloud-architecture)
- [CI/CD Pipeline](#cicd-pipeline)
- [Demo](#demo)

<br>


## How to use

1. Apache, php 설치
```shell
sudo yum update -y
# Apache install
sudo yum install httpd -y

# /etc/httpd/conf/httpd.conf에서 DocumentRoot를 "/var/www/html/flappy-bird"로 수정
sudo systemctl start httpd
sudo systemctl enable httpd

# php install
yum install -y php php-common php-opcache php-cli php-gd php-curl php-mysqlnd php-mysqli
```

2. 소스 코드 clone (루트 계정)
```shell
cd /var/www/html
git clone https://github.com/10000Jin/AWS-Bootcamp.git flappy-bird
```


<br><br>


## 3-Tier Architecture
> Service하는 Web Application의 구조.
<p align="center"><img src="img\3tier.png" width="85%"></p>

### Presentation Tier
- 사용자에게 보여지는 부분 (Flappy Bird 게임과 table과 같은 기타 요소 출력)
- 사용자로부터 정보를 수집 (유저명 입력)
- HTML, CSS, JS
### Application Tier
- 수집된 정보 처리 (데이터를 추가, 삭제, 수정 등 가능)
- Apache, PHP
### Database Tier
- Applicatoin이 처리하는 정보가 저장 및 관리되는 곳. (유저명, 점수, 날짜 등)
- Amazon RDS for MySQL

<br><br>

## Cloud Architecture
> Web Application을 올릴 서버 Infra 구성.
<p align="center"><img src="img\aws.png" width="95%"></p>

<!--
<details>
    <summary>Network</summary>
    <div>
        - 2개의 가용영역(Availabilty Zone)
    </div>
</details>
-->

### Network
- 2개의 가용영역(Availabilty Zone)
- 2개의 Publid Subnet & 4개의 Private Subnet
- NAT Gateway, Internet Gateway
### Compute
- Bastion Host
    - 개발 겸용, Elastic IP 사용, AMI 생성
- Auto Scaling Group
    - Bastion Host를 통해 ssh 접근 가능.
    - Desired : 2 / Minimum : 2 / Maximum : 4
    - 인스턴스 유형 : t2.medium
### Database
- Amazon RDS for MySQL
    - 관계형 데이터베이스
- 정형 데이터
    - 사용자 이름, 점수, 생성 날짜
- Multi-AZ 배포
    - 고가용성 실현 (대기 복사본 자동 생성)
### Other
- S3 bucket
    - 개발 서버에서 개정 내용 zip파일로 저장 (appspec.yml 포함)
- Lambda 
    - S3의 버킷 생성 이벤트 트리거해 CodeDeploy 실행
- CodeDeploy
    - Auto Scaling Group에 자동 배포
    - In-Place 방식

<br><br>

## CI/CD Pipeline
> CI/CD 파이프라인은 AWS의 CodePipeline을 사용하면 좀 더 정석에 가까울테지만 AWS Bootcamp동안 제공된 학습자용 계정은 CodePipeline과 CodeBuild 사용에 제한이 있었음.   
> 따라서 코드를 CodeCommit으로 **git push**하는 대신 appspec.yml과 beforeInstall.bash를 포함한 소스를 압축해 S3 버킷에 업로드하였고 CodePipeline 대신 Lambda로 대체.

<p align="center"><img src="img\cicd.png" width="90%"><br>CI/CD Pipeline</p>
<br>

### appspec.yml
<p align="center"><img src="img\appspec.png" width="60%"><br>CI/CD Pipeline</p>

- CodeDeploy의 배포 파일
- Source : 배포할 소스 파일(폴더) / Destination : 배포 위치
- Hooks : 배포 전후 실행할 스크립트 (배포 전 beforeInstall.bash 실행)
<br><br>

### beforeInstall.bash
<p align="center"><img src="img\beforeinstall.png" width="60%"><br>CI/CD Pipeline</p>

- 배포 파일 설치 전 기존 파일 삭제
<br><br>

### Zip파일 S3 저장

```shell
sudo zip -r myFB.zip ./*
aws s3 cp myFB.zip "s3://flappybird-codedeploy"
```

- 업데이트한 소스 파일을 압축한 zip파일을 S3에 올림.
- 아래와 같이 새로운 객체 생성.
<p align="center"><img src="img\s3.png" width="85%"><br>S3 Bucket</p>
<br><br>

### Lambda (AWS CodePipeline 대체)
<p align="center"><img src="img\lambda.png" width="70%"><br></p>

- Lambda에 S3 객체 생성 트리거를 추가하여 업데이트 내용이 담긴 zip파일이 업로드되면 CodeDeploy를 실행하는 Lambda function 동작.

```python
import boto3

def lambda_handler(event, context):
    # Create a new CodeDeploy client
    codedeploy = boto3.client('codedeploy')

    # Create a new deployment for the specified application
    response = codedeploy.create_deployment(
        applicationName = 'FlappyBird-Deploy',
        deploymentGroupName = 'FlappyBird-ASG-V2',
        revision = {
            'revisionType' : 'S3', 
            's3Location' : {
                'bucket' : 'flappybird-codedeploy',
                'key' : 'myFB.zip',
                'bundelType' : 'zip'
            }
        }
    )
```
- **'FlappyBird-Deploy’** 애플리케이션에서 **‘FlappyBird-ASG-V2’** 배포 그룹에 S3의 **'flappybird-codedeploy’** 버킷의 **'myFB.zip’** 파일로 배포

<br><br>

### 배포 방식
AWS CodeDeploy는 In-Place 방식과 Blue-Green 방식을 제공함.
<p align="center"><img src="img\deploy.png" width="80%"><br>In-Place (위) / Blue-Green (아래) <br>이미지 출처 : https://dev.classmethod.jp/articles/ci-cd-deployment-strategies-kr/</p>

- In-Place
    - 예를 들어 4개의 서버가 있다면 Load Balancer가 2개의 서버에 대한 연결을 끊고 업데이트 진행하는 동안 나머지 2개의 서버가 구버전으로 서비스.
    - 업데이트 완료 후 Load Balancer가 업데이트를 완료한 서버로 트래픽을 보내고 나머지 서버 2개에 대한 업데이트 진행.
    - 장점
        - 기존의 만들어진 인프라에 업데이트하기 때문에 간단하고 속도가 빠름.
    - 단점
        - 문제가 생겨 롤백의 경우 같은 방식으로 롤백을 해야하기 때문에 느림.
        - 가용 중이던 서버의 개수가 줄기 때문에 병목현상 발생 가능.

<br>

- Blue-Green
    - 2개의 서버가 있다면 구버전으로 서비스하는 동안 신버전으로 새로운 인스턴스를 생성.
    - 신버전의 인스턴스가 생성되면 Load Balancer가 구버전 인스턴스의 연결을 끊고 트래픽을 새로운 서버로 보냄.
    - 장점
        - 원래 사용하던 서버 개수를 유지하기 때문에 병목현상이 생길 확률이 적음.
        - 롤백이 필요한 경우 구버전의 인스턴스에 Load Balancer를 연결하면 되기 때문에 롤백이 빠름.
    - 단점
        - 서버를 늘리기 쉽지 않은 On-Premise 환경에서는 쉽지 않음. 가상환경이나 클라우드 환경에서 가능.

<br>

## Demo
- Demo 영상 (유튜브) : https://www.youtube.com/watch?v=90BEKXXqfZ0
