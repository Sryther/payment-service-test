#!/usr/bin/env bash

# Install global dependencies
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get update
apt-get install -y curl wget nodejs

# ==================================
# DOCKER
# ==================================

# Install Docker
curl -fsSL https://get.docker.com/ | sh

# Open TCP
mv /etc/init/docker.conf /etc/init/docker.conf.old
sed "0,/DOCKER_OPTS=/{s+DOCKER_OPTS=+DOCKER_OPTS='-H tcp://0.0.0.0:4243 -H unix:///var/run/docker.sock'+}" /etc/init/docker.conf.old > /etc/init/docker.conf

# Start the private registry
docker run -d -p 5000:5000 --restart=always --name registry registry:2

service docker restart

# ==================================
# ANSIBLE
# ==================================

apt-get install -y software-properties-common python-software-properties
apt-add-repository ppa:ansible/ansible
apt-get update
apt-get install -y ansible

# Launch the playbook
ansible-galaxy install geerlingguy.jenkins -p /vagrant/ansible/roles/
ansible-playbook /vagrant/ansible/configure-ci-server.yml

# Add the configurations
cp /vagrant/jenkins/configuration/org.jenkinsci.plugins.dockerbuildstep.DockerBuilder.xml /var/lib/jenkins/org.jenkinsci.plugins.dockerbuildstep.DockerBuilder.xml
cp /vagrant/jenkins/configuration/jenkins.plugins.nodejs.tools.NodeJSInstallation.xml /var/lib/jenkins/jenkins.plugins.nodejs.tools.NodeJSInstallation.xml

# Add the pre-configured job
mkdir -p /var/lib/jenkins/jobs/payment-service
cp /vagrant/jenkins/jobs/payment-service-jenkins-job.xml /var/lib/jenkins/jobs/payment-service/config.xml

# Set the owner to jenkins
chown -R jenkins:jenkins /var/lib/jenkins

# Restart the service
service jenkins restart
