export class Store
{
  public storage: Storage;
  public prefix: string;
  public ttl: number;

  constructor(storage: Storage, prefix: string, ttl: number = 0)
  {
    this.storage = storage;
    this.prefix = prefix;
    this.ttl = ttl * 1000;
    //TODO: Improve this to run once per prefix
    this.cleanup();
  }

  public get(key: string): null | string
  {
    if(!key || key.length < 1)
    {
      return null;
    }

    return this.stripTtl(this.storage.getItem(this.prefix + key));
  }

  public stripTtl(value: string): null | string
  {
    if(value === null)
    {
      return null;
    }
    let parts = value.split(",");
    if(parts.length === 1)
    {
      return parts[0];
    }
    let ttl = parseInt(parts.shift());
    if(ttl > 0 && ttl < Date.now())
    {
      return null;
    }
    return parts.join(",") || '';
  }

  public setWithTTL(key: string, value: string, ttl: number): void
  {
    if(!key || key.length < 1)
    {
      return;
    }
    ttl = ttl > 0 ? Date.now() + (ttl * 1000) : 0;
    this.storage.setItem(this.prefix + key, ttl + "," + value);
  }

  public set(key: string, value: string): void
  {
    this.setWithTTL(key, value, this.ttl);
  }

  public remove(key: string): void
  {
    this.storage.removeItem(this.prefix + key);
  }

  public cleanup()
  {
    for(let i = 0; i < this.storage.length; i++)
    {
      let key = this.storage.key(i);
      if(key === null)
      {
        continue;
      }

      if(key.startsWith(this.prefix))
      {
        let value = this.stripTtl(this.storage.getItem(key));
        if(value === null) // Check for TTLed values
        {
          this.storage.removeItem(key);
        }
      }
    }
  }
}
