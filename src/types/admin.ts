export interface AdminSummary {
  users: number;
  instances: number;
  containers: number;
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
  keypair_count: number;
}

export interface AdminPagination {
  page: number;
  per_page: number;
  total: number;
  total_pages: number;
}

export interface AdminPaginatedResponse<T> {
  items: T[];
  pagination: AdminPagination;
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
  created_at: string;
  updated_at: string;
}

export interface AdminContainer {
  id: string;
  name: string;
  status: string;
  openstack_name: string;
  owner_id: string;
  owner_email: string;
  owner_name: string;
  created_at: string;
  updated_at: string;
}

export interface AdminKeypair {
  id: string;
  name: string;
  status: string;
  fingerprint: string;
  source_type: string;
  instance_count: number;
  created_at: string;
  updated_at: string;
}

export interface AdminUserResources {
  user: AdminUser;
  instances: AdminInstance[];
  containers: AdminContainer[];
  keypairs: AdminKeypair[];
}

export interface AdminSystem {
  api_status: string;
  openstack_status: string;
  ssh_gateway_status: string;
  ns_proxy_status: string;
  http_proxy_status: string;
  storage_status: string;
  last_updated_at: string;
  message: string;
}
