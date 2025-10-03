// App.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  Button,
  SafeAreaView,
  Text,
  View,
  TextInput,
  FlatList,
} from 'react-native';
// Giả sử file Spec TS được đặt tại src/native/NativeRTNAttendance.ts
import RTN from './specs/NativeRTNAttendance';

const SERVICE_TYPE = '_rtn._tcp.'; // chuẩn DNS-SD, nhớ dấu chấm cuối

export default function App() {
  const [role, setRole] = useState<'idle' | 'teacher' | 'student'>('idle');
  const [serverInfo, setServerInfo] = useState<{
    ip: string;
    port: number;
  } | null>(null);
  const [serviceName, setServiceName] = useState<string>('');
  const [checkinPayload, setCheckinPayload] = useState('{"studentId":"S001"}');
  const [log, setLog] = useState<string[]>([]);
  const subRef = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    // Đăng ký sự kiện typed từ native để debug nhanh (onKeyAdded)
    subRef.current = RTN.onKeyAdded(({ key, value }) => {
      setLog(prev => [`EVENT ${key}=${value}`, ...prev]);
    });
    return () => {
      subRef.current?.remove();
    };
  }, []);

  const asTeacher = async () => {
    try {
      setRole('teacher');
      RTN.setSessionSecret('class-secret-123');
      const { ip, port } = await RTN.startServer();
      setServerInfo({ ip, port });
      const { serviceName } = await RTN.registerService(SERVICE_TYPE);
      setServiceName(serviceName);
      setLog(prev => [
        `Teacher ready at ${ip}:${port}, service=${serviceName}`,
        ...prev,
      ]);
    } catch (e: any) {
      setLog(prev => [`Teacher error: ${e?.message ?? String(e)}`, ...prev]);
    }
  };

  const stopTeacher = async () => {
    try {
      await RTN.unregisterService();
      await RTN.stopServer();
      setRole('idle');
      setLog(prev => [`Teacher stopped`, ...prev]);
    } catch (e: any) {
      setLog(prev => [
        `Stop teacher error: ${e?.message ?? String(e)}`,
        ...prev,
      ]);
    }
  };

  const asStudent = async () => {
    try {
      setRole('student');
      RTN.setSessionSecret('class-secret-123');
      await RTN.startDiscovery(SERVICE_TYPE, 8000); // 8s
      setLog(prev => [`Student discovering ${SERVICE_TYPE}`, ...prev]);
    } catch (e: any) {
      setLog(prev => [`Student error: ${e?.message ?? String(e)}`, ...prev]);
    }
  };

  const connectAndCheckin = async () => {
    try {
      // Nhập đúng serviceName (hiển thị từ bên Teacher), hoặc hardcode nếu biết trước
      if (!serviceName) {
        setLog(prev => [`Enter serviceName (e.g. from Teacher UI)`, ...prev]);
        return;
      }
      const { ip, port } = await RTN.resolveAndConnect(serviceName);
      setLog(prev => [`Connected to ${ip}:${port}`, ...prev]);
      const ack = await RTN.sendCheckin(checkinPayload);
      setLog(prev => [`Ack: ${JSON.stringify(ack)}`, ...prev]);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : (() => {
              try {
                return JSON.stringify(err);
              } catch {
                return String(err);
              }
            })();

      setLog(prev => [`Checkin error: ${msg}`, ...prev]);
    }
  };

  const stopStudent = async () => {
    try {
      await RTN.stopDiscovery();
      await RTN.disconnect();
      setRole('idle');
      setLog(prev => [`Student stopped`, ...prev]);
    } catch (e: any) {
      setLog(prev => [
        `Stop student error: ${e?.message ?? String(e)}`,
        ...prev,
      ]);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 18, fontWeight: '600' }}>
        RTN Attendance Demo
      </Text>

      <View style={{ flexDirection: 'row', gap: 8 }}>
        <Button title="I am Teacher" onPress={asTeacher} />
        <Button title="I am Student" onPress={asStudent} />
      </View>

      {role === 'teacher' && (
        <View style={{ gap: 8 }}>
          <Text>
            Server: {serverInfo ? `${serverInfo.ip}:${serverInfo.port}` : '-'}
          </Text>
          <Text>Service Name: {serviceName || '-'}</Text>
          <Button title="Stop Teacher" onPress={stopTeacher} />
        </View>
      )}

      {role === 'student' && (
        <View style={{ gap: 8 }}>
          <TextInput
            placeholder="Service Name (from Teacher)"
            value={serviceName}
            onChangeText={setServiceName}
            style={{ borderWidth: 1, padding: 8 }}
          />
          <TextInput
            placeholder="Checkin payload (JSON)"
            value={checkinPayload}
            onChangeText={setCheckinPayload}
            style={{ borderWidth: 1, padding: 8 }}
          />
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Connect & Checkin" onPress={connectAndCheckin} />
            <Button title="Stop Student" onPress={stopStudent} />
          </View>
        </View>
      )}

      <Text style={{ marginTop: 12 }}>Logs:</Text>
      <FlatList
        data={log}
        keyExtractor={(item, idx) => item + idx}
        renderItem={({ item }) => <Text>{item}</Text>}
      />
    </SafeAreaView>
  );
}
