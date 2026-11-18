import { Column, DataSource, Entity, PrimaryGeneratedColumn, getMetadataArgsStorage } from 'typeorm';
import { dateOnlyTransformer } from 'src/common/date-only.transformer';
import { Lote } from './entities/lote.entity';

@Entity('date_probe')
class DateProbe {
  @PrimaryGeneratedColumn() id: number;
  @Column({ type: 'date' }) plain: Date;
  @Column({ type: 'date', transformer: dateOnlyTransformer }) dateOnly: Date;
}

describe('date columns keep the calendar day on a server behind UTC', () => {
  const originalTz = process.env.TZ;
  let driver: any;
  let columns: Record<string, any>;

  beforeAll(async () => {
    process.env.TZ = 'America/Guayaquil'; // UTC-5
    const dataSource = new DataSource({ type: 'postgres', entities: [DateProbe] });
    await (dataSource as any).buildMetadatas();
    driver = dataSource.driver;
    const metadata = dataSource.getMetadata(DateProbe);
    columns = { plain: metadata.findColumnWithPropertyName('plain'), dateOnly: metadata.findColumnWithPropertyName('dateOnly') };
  });

  afterAll(() => {
    if (originalTz === undefined) delete process.env.TZ;
    else process.env.TZ = originalTz;
  });

  const midnightUtc = () => new Date('2024-01-15T00:00:00.000Z');

  it('reproduces the shift without the transformer (what the driver does with a UTC-midnight Date)', () => {
    expect(driver.preparePersistentValue(midnightUtc(), columns.plain)).toBe('2024-01-14');
  });

  it('stores the UTC calendar day of a Date with the transformer', () => {
    expect(driver.preparePersistentValue(midnightUtc(), columns.dateOnly)).toBe('2024-01-15');
    expect(driver.preparePersistentValue(new Date('2024-01-15T12:00:00.000Z'), columns.dateOnly)).toBe('2024-01-15');
  });

  it('passes date strings and nulls through and reads values back unchanged', () => {
    expect(driver.preparePersistentValue('2024-01-15', columns.dateOnly)).toBe('2024-01-15');
    expect(dateOnlyTransformer.to(null)).toBeNull();
    expect(dateOnlyTransformer.from('2024-01-15')).toBe('2024-01-15');
  });

  it('is applied to both Lote date columns', () => {
    const lote = getMetadataArgsStorage().columns.filter((c) => c.target === Lote);
    for (const name of ['fecha_entrada', 'fecha_venc']) {
      expect(lote.find((c) => c.propertyName === name)?.options.transformer).toBe(dateOnlyTransformer);
    }
  });
});
