export interface AdminSummary {
  users: number;
  instances: number;
  containers: number;
  apps: number;
  keypairs: number;
  status_counts: Record<string, number>;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
  updated_at: string;
  instance_count: number;
  container_count: number;
  app_count: number;
  keypair_count: number;
}

export interface AdminInstance {
  id: string;
  name: string;
  status: string;
  owner_id: string;
  owner_email: string;
  owner_name: string;
  flavor_id: string;
  flavor_name: string;
  image_id: string;
  fixed_ip: string;
  app_host: string;
  created_at: string;
  updated_at: string;
}

export interface AdminSystem {
  api_status: string;
  openstack_status: string;
  ssh_gateway_status: string;
  storage_status: string;
  last_updated_at: string;
  message: string;
}
