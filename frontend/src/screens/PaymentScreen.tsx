import React from 'react';
import { SafeAreaView, Alert, View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';
import { useNavigation } from '@react-navigation/native';

const PaymentScreen = () => {
  const navigation = useNavigation<any>();

  /* [필수입력] 가맹점 식별코드 */
  const userCode = 'imp19424728';

  /* [필수입력] 결제 데이터 */
  const data = {
    pg: 'html5_inicis',
    pay_method: 'card',
    name: '빌라메이트 이달의 관리비',
    amount: 100, // 테스트 결제 금액
    merchant_uid: `mid_${new Date().getTime()}`,
    buyer_name: '입주민',
    buyer_tel: '01012345678',
    buyer_email: 'test@naver.com',
    buyer_addr: '서울시 강남구 삼성동',
    buyer_postcode: '06018',
    m_redirect_url: 'https://example.com/payment/callback', // 웹뷰 방식 필수
    app_scheme: 'villamate',
  };

  const paymentHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
        <script type="text/javascript" src="https://cdn.iamport.kr/v1/iamport.js"></script>
        <script>
          document.addEventListener('DOMContentLoaded', function() {
            var IMP = window.IMP;
            IMP.init('${userCode}');
            IMP.request_pay(${JSON.stringify(data)}, function(rsp) {
              window.ReactNativeWebView.postMessage(JSON.stringify(rsp));
            });
          });
        </script>
      </head>
      <body>
      </body>
    </html>
  `;

  const handleMessage = (event: any) => {
    try {
      const response = JSON.parse(event.nativeEvent.data);
      const { imp_success, success, error_msg } = response;
      const isSuccess = imp_success === 'true' || imp_success === true || success === 'true' || success === true;

      if (isSuccess) {
        Alert.alert('결제 성공', '관리비 납부가 완료되었습니다.', [
          {
            text: '확인',
            onPress: () => navigation.navigate('ResidentDashboard', { isPaid: true }),
          },
        ]);
      } else {
        Alert.alert('결제 실패', `에러 메시지: ${error_msg || '사용자가 취소했습니다.'}`, [
          {
            text: '확인',
            onPress: () => navigation.navigate('ResidentDashboard'),
          },
        ]);
      }
    } catch (e) {
      console.error('Payment response parse error', e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        source={{ html: paymentHtml }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        originWhitelist={['*']}
        startInLoadingState={true}
        renderLoading={() => (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#007AFF" />
          </View>
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
});

export default PaymentScreen;
