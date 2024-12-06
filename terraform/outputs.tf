output "billing_service_ip" {
  value = kubernetes_service.billing.status[0].load_balancer[0].ingress[0].ip
}

output "billing_namespace" {
  value = kubernetes_namespace.billing.metadata[0].name
}