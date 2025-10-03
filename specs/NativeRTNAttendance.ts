import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type DiscoveredService = {
  serviceName: string;
  serviceType: string;
};

export type ResolvedService = {
  ip: string;
  port: number;
  serviceName: string;
};

export type checkinAck = {
  status: 'ok' | 'try_later' | 'error';
  receiptId?: string;
  serverTime?: number;
  message?: string;
};

export type KeyValuePair = {
  key: string;
  value: string;
};

export interface Spec extends TurboModule {
  setSessionSecret(sessionSecret: string): void;

  startServer(): Promise<{ ip: string; port: number }>;
  stopServer(): Promise<void>;
  registerService(serviceType: string): Promise<{ serviceName: string }>;
  unregisterService(): Promise<void>;

  startDiscovery(serviceType: string, timeoutMs: number): Promise<void>;
  stopDiscovery(): Promise<void>;
  resolveAndConnect(serviceName: string): Promise<{ ip: string; port: number }>;
  sendCheckin(payload: string): Promise<checkinAck>;
  disconnect(): Promise<void>;

  readonly onKeyAdded: CodegenTypes.EventEmitter<KeyValuePair>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRTNAttendance');
