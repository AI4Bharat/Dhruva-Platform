# commands to set up prometheus stack and adapter -- ignore if already done

helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo update
helm install prometheus prometheus-community/kube-prometheus-stack
helm install prom-adapter prometheus-community/prometheus-adapter 

# commands to set up dhruva k8s server
kubectl apply -f deployment/k8s/server/  
kubectl apply -f deployment/k8s/server/prometheus/custom-metrics-api/cm-adapter-serving-certs.yaml
kubectl apply -f deployment/k8s/server/prometheus/

