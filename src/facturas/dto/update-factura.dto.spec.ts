import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { UpdateFacturaDto } from './update-factura.dto';

describe('UpdateFacturaDto', () => {
  it('accepts a partial update without id_factura', async () => {
    const dto = plainToInstance(UpdateFacturaDto, { estado: 'pagada' });
    const errors = await validate(dto);
    expect(errors.map((e) => e.property)).not.toContain('id_factura');
  });
});

describe('UpdateFacturaDto clinic scope', () => {
  it('does not whitelist id_empresa, so a factura cannot be moved to another clinic', async () => {
    const dto = plainToInstance(UpdateFacturaDto, { id_empresa: 'emp-other' });
    const errors = await validate(dto, { whitelist: true, forbidNonWhitelisted: true });
    expect(errors.map((e) => e.property)).toContain('id_empresa');
  });
});
