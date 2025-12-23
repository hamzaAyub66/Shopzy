import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Vibration,
  View,
} from 'react-native';
import {
  AppButton,
  AppText,
  CartButtonWithIndicator,
  ImageCarousel,
  QuickActionButton,
  Spacer,
  StarRatingViewer,
} from '@app/components';
import { FlexContainer, MainContainer, PaddingContainer } from '@app/containers';
import { useCartStore } from '@app/store';
import { AppScreensParamsList, ProductType } from '@app/types';
import { AppColors } from '@app/utils';
import { showProductAddedToast, showProductRemovedToast, showToast } from '@app/utils/functions';
import { ArrowIcon, HeartIcon } from '@assets/svg';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { useIsFocused } from '@react-navigation/native';

const PriceAndDiscountIndicator = ({
  price,
  discount,
}: {
  price: number;
  discount?: number;
}) => (
  <FlexContainer position="start" direction="row">
    <AppText color="PrimaryBlue" fontFamily="ManropeBold">
      ${price || 0}
    </AppText>
    {discount ? (
      <>
        <Spacer space={10} between />
        <View style={styles.discountTextHolder}>
          <AppText color="PureWhite">{discount}% OFF</AppText>
        </View>
      </>
    ) : null}
  </FlexContainer>
);

type ProductDetailsScreenProps = BottomTabScreenProps<AppScreensParamsList, 'ProductDetails'>;

export default ({ navigation, route }: ProductDetailsScreenProps) => {
  const { id: productId } = route.params?.product;
  const store = useCartStore();
  const isFocused = useIsFocused();

  const [productDetails, setProductDetails] = useState<ProductType>();

  const isProductInCart = store.cart.some(
    item => item.product.id === productDetails?.id
  );

  const isProductInFavorites = useMemo(
    () => productDetails && store.favorites.some(p => p.id === productDetails.id),
    [store.favorites.length, productDetails]
  );

  const getProductDetails = async (id: number) => {
    if (!id) return;
    try {
      const res = await fetch(
        `https://drshawarma.co.uk/wp-json/wc/v3/products/${id}?consumer_key=ck_7ea1b661e677d7e9a8e49399f9b3645b5770eaae&consumer_secret=cs_d129aa6990ef4326dc5dab98de2e007e6265be87`
      );
      const productData = await res.json();
      if (productData?.id) {
        const updatedProduct: ProductType = {
          id: productData.id,
          title: productData.name,
          description: productData.description || productData.short_description || '',
          price: parseFloat(productData.price) || 0,
          discountPercentage:
            productData.sale_price && parseFloat(productData.regular_price)
              ? Math.round(
                  ((parseFloat(productData.regular_price) - parseFloat(productData.sale_price)) /
                    parseFloat(productData.regular_price)) *
                    100
                )
              : 0,
          rating: parseFloat(productData.average_rating) || 0,
          stock: productData.stock_quantity || 0,
          brand: productData.brands?.[0] || '',
          category: productData.categories?.[0]?.name || '',
          thumbnail: productData.images?.[0]?.src || '',
          images: productData.images?.map((img: any) => img.src) || [],
          isFavorite: store.favorites.some(f => f.id === productData.id),
        };
        setProductDetails(updatedProduct);
      }
    } catch (error) {
      console.error('Failed to fetch product details:', error);
    }
  };

  const handleAddToCart = () => {
    if (!productDetails) return;
    if (isProductInCart) {
      store.removeFromCart(productDetails.id);
      showProductRemovedToast(productDetails.title);
    } else {
      store.addToCart(productDetails, 1);
      showProductAddedToast(productDetails.title);
    }
  };

  const handleBuyNow = () => {
    if (!productDetails) return;
    store.addToCart(productDetails, 1);
    navigation.navigate('Cart');
  };

  const handleFavorite = () => {
    if (!productDetails) return;
    if (isProductInFavorites) {
      store.removeFromFavorites(productDetails.id);
    } else {
      store.addToFavorites(productDetails);
      Vibration.vibrate(5);
      showToast('Added to favorites', `${productDetails.title} added to favorites!`);
    }
  };

  useEffect(() => {
    getProductDetails(productId);
  }, [isFocused, store.favorites.length]);

  if (!productDetails) {
    return (
      <MainContainer fillHeight>
        <ActivityIndicator color={AppColors.PrimaryBlue} />
      </MainContainer>
    );
  }

  return (
    <MainContainer style={{ paddingHorizontal: 0 }} fillHeight>
      <PaddingContainer style={{ paddingVertical: 0 }}>
        <FlexContainer direction="row" position="rowBetween">
          <QuickActionButton onPress={navigation.goBack}>
            <ArrowIcon fill={AppColors.GreyDark} height={12} width={12} />
          </QuickActionButton>
          <CartButtonWithIndicator
            quantity={store.cart.length}
            onPress={() => navigation.navigate('Cart')}
            cartIconColor={AppColors.GreyDark}
          />
        </FlexContainer>
      </PaddingContainer>

      <Spacer space={10} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={() => getProductDetails(productId)}
            tintColor={AppColors.PrimaryBlue}
          />
        }
      >
        <View>
          <PaddingContainer>
            <AppText fontSize="infiniteLarge">{productDetails.title}</AppText>
            <Spacer space={10} />
            <StarRatingViewer rating={productDetails.rating} />
            <Spacer space={15} />
          </PaddingContainer>

          <View>
            <View style={styles.favoriteButtonHolder}>
              <QuickActionButton onPress={handleFavorite} style={styles.favoriteButton}>
                <HeartIcon
                  height={27}
                  width={27}
                  stroke={isProductInFavorites ? 'none' : AppColors.GreyDark}
                  fill={isProductInFavorites ? AppColors.LightOrange : 'none'}
                />
              </QuickActionButton>
            </View>
            <ImageCarousel images={productDetails.images} />
          </View>

          <Spacer space={26} />

          <PaddingContainer>
            <PriceAndDiscountIndicator
              price={productDetails.price}
              discount={productDetails.discountPercentage}
            />
            <Spacer space={26} />
            <FlexContainer direction="row" position="center">
              <AppButton
                style={styles.addToCartButton}
                onPress={handleAddToCart}
                color="PrimaryBlue"
              >
                {isProductInCart ? 'Remove From Cart' : 'Add To Cart'}
              </AppButton>
              <Spacer space={20} between />
              <AppButton onPress={handleBuyNow} style={{ flex: 1 }}>
                Buy Now
              </AppButton>
            </FlexContainer>
            <Spacer space={20} />
            <AppText>Details</AppText>
            <Spacer space={6} />
            <AppText color="GreyLightest">{productDetails.description}</AppText>
          </PaddingContainer>
        </View>
      </ScrollView>
    </MainContainer>
  );
};

const styles = StyleSheet.create({
  discountTextHolder: {
    paddingVertical: 4,
    paddingHorizontal: 15,
    borderRadius: 100,
    backgroundColor: AppColors.PrimaryBlue,
  },
  addToCartButton: {
    borderWidth: 1,
    borderColor: AppColors.PrimaryBlue,
    backgroundColor: undefined,
    flex: 1,
  },
  favoriteButton: {
    borderRadius: 20,
    backgroundColor: AppColors.PureWhite,
    height: 53,
    width: 53,
  },
  favoriteButtonHolder: {
    position: 'absolute',
    zIndex: 1,
    right: 20,
    top: 20,
  },
});
