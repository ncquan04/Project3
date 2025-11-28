import type { CodegenTypes, TurboModule } from 'react-native';
import { TurboModuleRegistry } from 'react-native';

export type DiscoveredService = {
  serviceName: string;
};

export type ResolvedService = {
  ip: string;
  port: number;
  serviceName: string;
};

export type CheckinAck = {
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
  registerService(): Promise<{ serviceName: string }>;
  unregisterService(): Promise<void>;

  findService(timeoutMs: number): Promise<DiscoveredService>;
  stopDiscovery(): Promise<void>;
  resolveAndConnect(serviceName: string): Promise<{ ip: string; port: number }>;
  sendCheckin(payload: string): Promise<CheckinAck>;
  disconnect(): Promise<void>;
}

export default TurboModuleRegistry.getEnforcing<Spec>('NativeRTNAttendance');
