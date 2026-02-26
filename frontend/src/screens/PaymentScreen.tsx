import React from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import IMP from 'iamport-react-native';

const API_BASE_URL = 'http://192.168.219.108:3000';

export default function PaymentScreen({ route, navigation }: any) {
  const { paymentId, amount, invoiceName } = route.params;

  const merchantUid = `villamate_${paymentId}_${Date.now()}`;

  const data = {
    pg: 'html5_inicis',
    pay_method: 'card',
    name: invoiceName,
    merchant_uid: merchantUid,
    amount: amount,
    buyer_name: '입주민',
    buyer_tel: '010-0000-0000',
    buyer_email: 'resident@villamate.app',
    escrow: false,
    app_scheme: 'villamate',
  };

  const callback = async (response: any) => {
    if (response.success) {
      try {
        await fetch(`${API_BASE_URL}/api/payments/${paymentId}/status`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'COMPLETED' }),
        });
        Alert.alert('결제 완료', '결제가 성공적으로 완료되었습니다.', [
          { text: '확인', onPress: () => navigation.goBack() },
        ]);
      } catch (e) {
        Alert.alert('오류', '결제는 완료되었으나 상태 업데이트에 실패했습니다.');
        navigation.goBack();
      }
    } else {
      Alert.alert('결제 실패', response.error_msg || '결제에 실패했습니다.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <IMP.Payment
        userCode="imp14397622"
        data={data as any}
        callback={callback}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});
