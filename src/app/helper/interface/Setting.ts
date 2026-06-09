

export interface Setting {
  sid: number;
  name: string;
  description: string;
  value: string;
  dateCreated?: Date;
  dateUpdated?: Date;
}