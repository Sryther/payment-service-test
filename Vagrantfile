# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.box = "hashicorp/precise64"

  config.vm.network :forwarded_port, guest: 5000, host: 5000
  config.vm.network :forwarded_port, guest: 8080, host: 8080
  config.vm.network :forwarded_port, guest: 22, host: 22
  config.vm.network :private_network, ip: "172.21.12.10", auto_config: false

  config.vm.provider "virtualbox" do |vb|
    vb.memory = "1024"
  end

  config.vm.provider "hyperv" do |hv|
    config.vm.synced_folder ".", "/vagrant", type: "smb"
    hv.ip_address_timeout = 240
    vb.memory = "1024"
  end

  config.vm.provision :shell, :path => "provision.sh"
end
