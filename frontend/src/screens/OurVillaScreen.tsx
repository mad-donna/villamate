import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface MenuItemProps {
  icon: string;
  iconColor: string;
  iconBg: string;
  label: string;
  description?: string;
  onPress: () => void;
}

const MenuItem = ({ icon, iconColor, iconBg, label, description, onPress }: MenuItemProps) => (
  <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
    <View style={[styles.menuIconWrap, { backgroundColor: iconBg }]}>
      <Ionicons name={icon as any} size={20} color={iconColor} />
    </View>
    <View style={styles.menuTextGroup}>
      <Text style={styles.menuLabel}>{label}</Text>
      {description ? <Text style={styles.menuDesc}>{description}</Text> : null}
    </View>
    <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
  </TouchableOpacity>
);

const SectionHeader = ({ title }: { title: string }) => (
  <Text style={styles.sectionHeader}>{title}</Text>
);

const OurVillaScreen = ({ navigation }: any) => {
  const [villaName, setVillaName] = useState<string>('');
  const [villaAddress, setVillaAddress] = useState<string>('');

  useEffect(() => {
    AsyncStorage.getItem('user').then((raw) => {
      if (!raw) return;
      const user = JSON.parse(raw);
      if (user?.villa?.name) setVillaName(user.villa.name);
      if (user?.villa?.address) setVillaAddress(user.villa.address);
    });
  }, []);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Villa header card */}
        <View style={styles.villaCard}>
          <View style={styles.villaIconWrap}>
            <Ionicons name="business" size={32} color="#5856D6" />
          </View>
          <View style={styles.villaInfo}>
            <Text style={styles.villaLabel}>우리 빌라</Text>
            <Text style={styles.villaName} numberOfLines={1}>
              {villaName || '빌라 정보 로딩 중...'}
            </Text>
            {villaAddress ? (
              <Text style={styles.villaAddress} numberOfLines={1}>{villaAddress}</Text>
            ) : null}
          </View>
        </View>

        {/* Section 1: 관리 */}
        <View style={styles.section}>
          <SectionHeader title="관리" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="construct-outline"
              iconColor="#5856D6"
              iconBg="#EEEEFF"
              label="건물 이력 및 수리 내역"
              description="하자보수, 정기점검, 계약 이력"
              onPress={() => navigation.navigate('BuildingHistory')}
            />
          </View>
        </View>

        {/* Section 2: 차량 */}
        <View style={styles.section}>
          <SectionHeader title="차량" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="car-outline"
              iconColor="#30B0C7"
              iconBg="#E5F7FA"
              label="우리 집 차량 관리"
              description="등록 차량 확인 및 수정"
              onPress={() => navigation.navigate('VehicleManagement')}
            />
          </View>
        </View>

        {/* Section 3: 관리비 */}
        <View style={styles.section}>
          <SectionHeader title="관리비" />
          <View style={styles.menuCard}>
            <MenuItem
              icon="receipt-outline"
              iconColor="#FF9500"
              iconBg="#FFF4E5"
              label="관리비 조회"
              description="청구 내역 및 납부 현황 확인"
              onPress={() => navigation.navigate('ResidentInvoice')}
            />
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F3F7',
  },

  // Villa header
  villaCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 8,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
  },
  villaIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#EEEEFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  villaInfo: { flex: 1 },
  villaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  villaName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  villaAddress: {
    fontSize: 13,
    color: '#8E8E93',
  },

  // Sections
  section: {
    marginTop: 12,
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: '700',
    color: '#8E8E93',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginLeft: 20,
    marginBottom: 8,
  },
  menuCard: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  // Menu items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  menuIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  menuTextGroup: {
    flex: 1,
  },
  menuLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 2,
  },
  menuDesc: {
    fontSize: 13,
    color: '#8E8E93',
  },
});

export default OurVillaScreen;
