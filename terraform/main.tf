provider "kubernetes" {
  config_path = var.kubeconfig_path
}

resource "kubernetes_namespace" "billing" {
  metadata {
    name = "billing"
  }
}

resource "kubernetes_secret" "env_vars" {
  metadata {
    name      = "env-vars"
    namespace = kubernetes_namespace.billing.metadata[0].name
  }

  data = {
    NODE_ENV                  = base64encode("development")
    PORT                      = base64encode("8080")
    MONGO_URI                 = base64encode("mongodb://billing-manager-mongodb:27017/billing")
    STRIPE_SECRET_KEY         = base64encode("")
    STRIPE_SECRET_WEBHOOK     = base64encode("")
  }
}

resource "kubernetes_deployment" "billing" {
  metadata {
    name      = "billing"
    namespace = kubernetes_namespace.billing.metadata[0].name
  }

  spec {
    replicas = 1

    selector {
      match_labels = {
        app = "billing"
      }
    }

    template {
      metadata {
        labels = {
          app = "billing"
        }
      }

      spec {
        container {
          image = "billing:latest"
          name  = "billing"

          port {
            container_port = var.port
          }

          env_from {
            secret_ref {
              name = kubernetes_secret.env_vars.metadata[0].name
            }
          }

          volume_mount {
            mount_path = "/data/db"
            name       = "billing-data"
          }
        }

        container {
          image = "mongo:latest"
          name  = "mongodb"

          volume_mount {
            mount_path = "/data/db"
            name       = "billing-data"
          }
        }

        volume {
          name = "billing-data"

          persistent_volume_claim {
            claim_name = kubernetes_persistent_volume_claim.mongo_data.metadata[0].name
          }
        }
      }
    }
  }
}

resource "kubernetes_service" "billing" {
  metadata {
    name      = "billing"
    namespace = kubernetes_namespace.billing.metadata[0].name
  }

  spec {
    selector = {
      app = "billing"
    }

    port {
      port        = var.port
      target_port = var.port
    }

    type = "LoadBalancer"
  }
}

resource "kubernetes_persistent_volume" "mongo_data" {
  metadata {
    name = "mongo-data"
  }

  spec {
    capacity = {
      storage = "5Gi"
    }

    access_modes = ["ReadWriteOnce"]

    persistent_volume_reclaim_policy = "Retain"

    host_path {
      path = "/mnt/data"
    }
  }
}

resource "kubernetes_persistent_volume_claim" "mongo_data" {
  metadata {
    name      = "mongo-data"
    namespace = kubernetes_namespace.billing.metadata[0].name
  }

  spec {
    access_modes = ["ReadWriteOnce"]

    resources {
      requests = {
        storage = "5Gi"
      }
    }
  }
}