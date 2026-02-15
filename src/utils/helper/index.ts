import { ClassTransformOptions, plainToInstance } from 'class-transformer';

export const circularToJSON = (circular: unknown) =>
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  circular && JSON.parse(JSON.stringify(circular));

/**
 *
 * @param {type} cls - the class to transform
 * @param {type} obj - the object to transform
 * @param {type} options - additional options for the transformation
 * @return {type} the transformed instance of the class
 */
export function transformer<
  V extends { new (...args: unknown[]): unknown },
  T extends ConstructorParameters<V>[0],
>(
  cls: V,
  obj: T extends undefined ? Array<unknown> : T[],
  options?: ClassTransformOptions & { raw?: boolean },
): InstanceType<V>[];
export function transformer<
  V extends { new (...args: unknown[]): unknown },
  T extends ConstructorParameters<V>[0],
>(
  cls: V,
  obj: T extends undefined ? unknown : T,
  options?: ClassTransformOptions & { raw?: boolean },
): InstanceType<V>;
export function transformer<
  V extends { new (...args: unknown[]): unknown },
  T extends ConstructorParameters<V>[0],
>(
  cls: V,
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  obj: T extends undefined ? unknown | Array<unknown> : T | T[],
  options?: ClassTransformOptions & { raw?: boolean },
) {
  const result = plainToInstance(
    cls,
    options?.raw ? obj : circularToJSON(obj),
    {
      excludeExtraneousValues: true,
      exposeUnsetFields: true,
      enableImplicitConversion: true,
      // exposeDefaultValues: true,
      ...options,
    },
  );
  return result;
}
