import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

/* Whether the user wants to be notified when the bond's annual rate is
 * greater than or less than the given value
 */
export type NotificationType = 'greater' | 'less';
export enum nType {
  GREATER = 'greater',
  LESS = 'less',
}

@Entity('notifications')
class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('int')
  value: number;

  @Column('enum', { enum: nType })
  type: nType;

  @Column('boolean')
  notifyByEmail: boolean;

  @Column('boolean')
  notifyByBrowser: boolean;
}

export default Notification;
