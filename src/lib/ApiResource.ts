// Rol Target del Patron Adapter: la interfaz que el cliente espera recibir
// Toda entidad expuesta por la API sabe convertirse a su JSON público mediante toApi()
// independientemente del JSON crudo que regrese de la consulta a la base de datos.

export interface ApiResource<DTO> {
  toApi(): DTO;
}
