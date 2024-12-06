variable "port" {
  description = "Port for the billing service"
  type        = number
  default     = 8080
}

variable "persistent_volume_source" {
  description = "persistent volume source path"
  type        = string
  default     = "/mnt/data"
}

variable "kubeconfig_path" {
  description = "Path to miniKube"
  type    = string
  default = "~/.kube/config"
}

variable "server_port" {
  description = "Port for the billing service"
  type        = number
}