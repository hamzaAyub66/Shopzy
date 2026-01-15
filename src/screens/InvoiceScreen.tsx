import React from 'react';
import { StyleSheet, ScrollView, TouchableOpacity, View } from 'react-native';
import { FlexContainer, MainContainer, PaddingContainer } from '@app/containers';
import { AppText, QuickActionButton, Spacer } from '@app/components';
import { AppColors } from '@app/utils';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { AppScreensParamsList } from '@app/types';
import { ArrowIcon } from '@assets/svg';
import * as Print from 'expo-print';

const generateInvoiceHTML = (order: any) => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', hour12: false
    });
  };

  return `
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
        <style>
          @page { 
            size: A6; 
            margin: 0; 
          }
          body { font-family: 'Helvetica', sans-serif; padding: 40px; background-color: #f0f0f0; display: flex; justify-content: center; }
          
          .receipt-card { 
            background-color: white; 
            
            width: 100%; 
            max-width: 500px; 
            padding: 30px; 
            border-radius: 4px; 
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
          }
          .brand-name { 
            font-size: 28px; 
            text-align: center; 
            font-weight: bold; 
            text-transform: uppercase; 
            margin-bottom: 5px;
          }
          .black-divider { 
            height: 3px; 
            background-color: black; 
            margin: 20px 0; 
          }
          .meta-text { font-size: 14px; line-height: 1.6; color: #333; }
          .bold { font-weight: bold; }
          .dashed-line { 
            border-top: 2px dashed #E0E0E0; 
            margin: 20px 0; 
          }
          .row { display: flex; flex-direction: row; margin-bottom: 10px; }
          .item-col { flex: 3; font-size: 14px; }
          .qty-col { flex: 1; text-align: center; font-size: 14px; }
          .price-col { flex: 1; text-align: center; font-size: 14px; }
          .total-col { flex: 1; text-align: right; font-size: 14px; }
          .total-row { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            margin-top: 10px;
          }
          .grand-total { font-size: 24px; font-weight: bold; }
          .thanks-text { 
            text-align: center; 
            font-style: italic; 
            color: #999; 
            margin-top: 30px; 
            font-size: 14px;
          }
        </style>
      </head>
      <body>
        <div class="receipt-card">
          <div class="brand-name">Dr Shawarma</div>
          <div class="black-divider"></div>

          <div class="meta-text">Invoice: <span class="bold">#${order?.id}</span></div>
          <div class="meta-text">Date: <span>${formatDate(order?.created_at)}</span></div>
          
          <div style="margin-top: 15px;">
            <div class="bold" style="font-size: 15px;">Customer Details:</div>
            <div class="meta-text">${order?.customer?.name}</div>
            <div class="meta-text">${order?.customer?.address?.address_1}, ${order?.customer?.address?.postcode}</div>
          </div>

          <div class="dashed-line"></div>

          <div class="row bold">
            <div class="item-col">Item</div>
            <div class="qty-col">Qty</div>
            <div class="price-col">Price/</div>
            <div class="total-col">Total</div>
          </div>

          ${order?.items?.map((item: any) => `
            <div class="row">
              <div class="item-col">${item.name}</div>
              <div class="qty-col">${item.quantity}</div>
              <div class="price-col">£${item?.unit_price}</div>
              <div class="total-col">£${item?.line_total}</div>
            </div>
          `).join('')}

          <div class="dashed-line"></div>

          <div class="total-row">
            <div style="font-size: 18px;">Total</div>
            <div class="grand-total">£${order?.total}</div>
          </div>

          <div class="thanks-text">Thank you for your purchase!</div>
        </div>
      </body>
    </html>
  `;
};


// Define Props type just like your HomeScreen
type InvoiceScreenProps = NativeStackScreenProps<AppScreensParamsList, 'InvoiceScreen'>;

export default ({ route, navigation }: InvoiceScreenProps): React.ReactNode => {
  const { order } = route.params;

  const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  
  // Format: "04 Dec 2025, 16:33"
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
};

const printInvoice = async () => {
  const html = generateInvoiceHTML(order);

  await Print.printAsync({
    html,
  });
};

  return (
      <MainContainer
      style={styles.container}
      backgroundColor={AppColors.PureWhite}
      fillHeight
    >
      <ScrollView 
        showsVerticalScrollIndicator={false}
        // Use scrollContent to handle the internal padding
        contentContainerStyle={styles.scrollContent}
      >
        <PaddingContainer style={styles.headerPadding}>
          <Spacer space={30} />
          
          <View style={styles.receiptCard}>
            <AppText style={styles.brandName} fontFamily="ManropeBold">
              Dr Shawarma
            </AppText>
            
            <View style={styles.blackDivider} />

            <AppText fontSize="small">Invoice: <AppText fontFamily="ManropeSemiBold">#{order?.id}</AppText></AppText>
            <AppText fontSize="small">
              Date: <AppText fontFamily="ManropeMedium">{formatDate(order?.created_at)}</AppText>
            </AppText>
            
            <Spacer space={15} />
            <AppText fontFamily="ManropeSemiBold">Customer Details:</AppText>
            <AppText fontSize="small">{order?.customer?.name}</AppText>
            <AppText fontSize="small">{order?.customer?.address?.address_1}, {order?.customer?.address?.postcode}</AppText>

            <View style={styles.dashedLine} />

            <View style={styles.row}>
              <AppText style={{ flex: 4 }} fontFamily="ManropeBold">Item</AppText>
              <AppText style={{ flex: 1, textAlign: 'center' }} fontFamily="ManropeBold">Qty</AppText>
              <AppText style={{ flex: 1.5, textAlign: 'right' }} fontFamily="ManropeBold">Price</AppText>
              <AppText style={{ flex: 1.5, textAlign: 'right' }} fontFamily="ManropeBold">Total</AppText>
            </View>

            {order?.items?.map((item: any, index: number) => (
              <View key={index} style={[styles.row, { marginTop: 10 }]}>
                <View style={{ flex: 4 }}>
                  <AppText fontSize="small">{item.name}</AppText>
                </View>
                <AppText style={{ flex: 1, textAlign: 'center' }} fontSize="small">{item.quantity}</AppText>
                <AppText style={{ flex: 1.5, textAlign: 'right' }} fontSize="small">£{item.unit_price}</AppText>
                <AppText style={{ flex: 1.5, textAlign: 'right' }} fontSize="small">£{item?.line_total}</AppText>
              </View>
            ))}

            <View style={styles.dashedLine} />

            <View style={styles.rowBetween}>
              <AppText>Total</AppText>
              <AppText fontSize="extraLarge" fontFamily="ManropeBold">£{order?.total}</AppText>
            </View>

            <Spacer space={20} />
            <AppText style={styles.thanksText}>Thank you for your purchase!</AppText>
          </View>
        </PaddingContainer>
      </ScrollView>

      {/* Fixed Button Footer */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity 
          style={styles.printButton} 
          onPress={printInvoice}>
          <AppText color="PureWhite" fontFamily="ManropeBold">PRINT INVOICE</AppText>
        </TouchableOpacity>
      </View>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 0,
    paddingVertical: 0,
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 110, // Ensures content isn't hidden by the fixed button
  },
  headerPadding: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  receiptCard: {
    backgroundColor: AppColors.PureWhite,
    padding: 20,
    borderRadius: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    width: '100%',
  },
  brandName: {
    fontSize: 24,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  blackDivider: {
    height: 2,
    backgroundColor: '#000',
    marginVertical: 15,
  },
  dashedLine: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
    marginVertical: 15,
    borderRadius: 1, 
  },
  row: {
    flexDirection: 'row',
    width: '100%',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  thanksText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#999',
  },
  buttonWrapper: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: AppColors.PureWhite,
    paddingHorizontal: 20,
    paddingVertical: 15, // SafeAreaView 'bottom' edge handles the extra space now
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    elevation: 5, // Ensures it sits above the scroll content on Android
  },
  printButton: {
    backgroundColor: AppColors.PrimaryBlue,
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
});