export class Store
{
  public storage: Storage;
  public prefix: string;
  public ttl: number;

  constructor(storage: Storage, prefix: string, ttl: number = 0)
  {
    this.storage = storage;
    this.prefix = prefix;
    this.ttl = ttl;
    //TODO: Improve this to run once per prefix
    this.cleanup();
  }

  public get(key: string): null | string
  {
    if(key === "")
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
    let ttl = parseInt(parts[0]);
    if(ttl > 0 && ttl < Date.now())
    {
      console.log("TTLed value", value, parts[0], ttl, parts[1]);
      return null;
    }
    return parts[1] || '';
  }

  public setWithTTL(key: string, value: string, ttl: number): void
  {
    if(key === "")
    {
      return;
    }
    ttl = ttl > 0 ? Date.now() + ttl : 0;
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
        console.log(key, value);
        if(value === null) // Check for TTLed values
        {
          this.storage.removeItem(key);
        }
      }
    }
  }
}
