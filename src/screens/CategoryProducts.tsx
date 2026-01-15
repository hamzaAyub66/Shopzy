import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  View,
  TextInput,
} from "react-native";

import { AppScreensParamsList, ProductType } from "@app/types";
import { BottomTabScreenProps } from "@react-navigation/bottom-tabs";
import { AppColors } from "@app/utils";
import { MainContainer, PaddingContainer, FlexContainer } from "@app/containers";
import {
  AppText,
  CartButtonWithIndicator,
  ProductGridList,
  Spacer,
  QuickActionButton,
} from "@app/components";
import { useCartStore } from "@app/store";
import { ArrowIcon, SearchIcon } from "@assets/svg";
import {
  showProductAddedToast,
  showProductRemovedToast,
} from "@app/utils/functions";

type CategoryProductScreenProps = BottomTabScreenProps<
  AppScreensParamsList,
  "CategoryProductsScreen"
>;

export default function CategoryProductsScreen({
  navigation,
  route,
}: CategoryProductScreenProps) {
  const { categoryId, categoryName } = route.params;

  const [productList, setProductList] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const store = useCartStore();

  const fetchProductsByCategory = async () => {
    try {
      const url = `https://drshawarma.co.uk/wp-json/wc/v3/products?category=${categoryId}&per_page=50&consumer_key=ck_7ea1b661e677d7e9a8e49399f9b3645b5770eaae&consumer_secret=cs_d129aa6990ef4326dc5dab98de2e007e6265be87`;

      const res = await fetch(url);
      const data = await res.json();

      const formatted = data.map((p: any) => ({
        id: p.id,
        title: p.name,
        description: p.description || "",
        price: Number(p.price),
        discountPercentage: 0,
        rating: Number(p.average_rating),
        stock: p.stock_status === "instock" ? 1 : 0,
        brand: "",
        category: p.categories?.[0]?.name || "",
        thumbnail: p.images?.[0]?.src || "",
        images: p.images?.map((img: any) => img.src) || [],
        isFavorite: store.favorites.some((x) => x.id === p.id),
      }));

      setProductList(formatted);
    } catch (e) {
      console.log("Error fetching category products", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductsByCategory();
  }, []);

  const onAddToCart = (product: ProductType, inCart: boolean) => {
    if (inCart) {
      store.removeFromCart(product.id);
      showProductRemovedToast(product.title);
    } else {
      store.addToCart(product, 1);
      showProductAddedToast(product.title);
    }
  };

  const onProductPress = (product: ProductType) => {
    navigation.navigate("ProductDetails", { product });
  };

  // Filter products by search text
  const filteredProducts = productList.filter((p) =>
    p.title.toLowerCase().includes(searchText.toLowerCase())
  );

  // Header with Back button, Title, Category Name + Product Count + Search Bar
  const Header = (
    <PaddingContainer style={styles.headerPadding}>
      <FlexContainer direction="row" position="rowBetween">
        {/* Back Button */}
        <QuickActionButton onPress={() => navigation.goBack()}>
          <ArrowIcon fill={AppColors.GreyDark} height={12} width={12} />
        </QuickActionButton>

        {/* Title */}
        <AppText fontSize="large" fontFamily="ManropeBold">
          Products
        </AppText>

        {/* Spacer */}
        <View style={styles.headerSpacer} />
      </FlexContainer>

      <Spacer space={20} />

      {/* Category Name + Product Count */}
      <AppText color="LightOrange" fontSize="large" fontFamily="ManropeBold">
        {categoryName} ({productList.length} Products)
      </AppText>

      <Spacer space={10} />

      {/* Search Bar */}
      <View style={styles.searchInput}>
        <SearchIcon height={18} width={18} />
        <Spacer space={12} />
        <TextInput
          style={styles.textInput}
          placeholderTextColor={AppColors.GreyLightest}
          placeholder="Search Products or store"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      <Spacer space={10} />
    </PaddingContainer>
  );

  return (
    <MainContainer backgroundColor={AppColors.PureWhite} fillHeight>
      {loading ? (
        <FlexContainer fillHeight position="center">
          <ActivityIndicator size="large" color={AppColors.PrimaryBlue} />
        </FlexContainer>
      ) : (
        <ProductGridList
          ListHeaderComponent={Header}
          productList={filteredProducts}
          onAddToCart={onAddToCart}
          onProductPress={onProductPress}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={fetchProductsByCategory}
              tintColor={AppColors.PrimaryBlue}
            />
          }
        />
      )}
    </MainContainer>
  );
}

const styles = StyleSheet.create({
  headerPadding: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  headerSpacer: {
    width: 40,
  },
  searchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: AppColors.GreyDark,
  },
});
