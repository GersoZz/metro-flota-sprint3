/**
 * Rol Creator del patrón Factory Method.
 *
 * @typeParam Row - shape de la fila de Prisma
 * @typeParam DTO - shape del DTO de la API
 */
export abstract class DtoFactory<Row, DTO> {
  abstract create(row: Row): DTO;

  many(rows: Row[]): DTO[] {
    return rows.map((row) => this.create(row));
  }
}
