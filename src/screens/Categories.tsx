import React, {useEffect, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  View,
} from 'react-native';
import {AppText, QuickActionButton, Spacer} from '@app/components';
import {FlexContainer, MainContainer, PaddingContainer} from '@app/containers';
import {AppScreensParamsList} from '@app/types';
import {AppColors} from '@app/utils';
import {ArrowIcon} from '@assets/svg';
import {BottomTabScreenProps} from '@react-navigation/bottom-tabs';

type CategoriesScreenProps = BottomTabScreenProps<AppScreensParamsList, 'CategoriesScreen'>;

interface Category {
  id: number;
  name: string;
  slug: string;
  count: number;
  image: string;
}

const CategoriesScreen = ({navigation}: CategoriesScreenProps): React.ReactNode => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const getCategories = async () => {
    try {
      const res = await fetch(
        'https://drshawarma.co.uk/wp-json/wc/v3/products/categories?consumer_key=ck_7ea1b661e677d7e9a8e49399f9b3645b5770eaae&consumer_secret=cs_d129aa6990ef4326dc5dab98de2e007e6265be87'
      );

      const data = await res.json();

      const mapped = data.map((cat: any) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count || 0,
        image: cat.image?.src || "",
      }));

      setCategories(mapped);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const renderCategoryItem = ({item}: {item: Category}) => (
    <TouchableOpacity
      activeOpacity={0.7}
      style={styles.categoryCard}
      onPress={() => alert(`Selected: ${item.name}`)}>
      
      <View style={styles.iconCircle}>
        <AppText color="PrimaryBlue" fontFamily="ManropeBold">
          {item.name.charAt(0)}
        </AppText>
      </View>

      <Spacer space={12} />

      <AppText
        fontSize="medium"
        fontFamily="ManropeSemiBold"
        style={styles.categoryName}>
        {item.name}
      </AppText>

      <Spacer space={6} />

      {/* PRODUCT COUNT */}
      <AppText color="GreyLightest" fontSize="small">
        {item.count} Products
      </AppText>
    </TouchableOpacity>
  );

  return (
    <MainContainer backgroundColor={AppColors.PureWhite} fillHeight>
      {/* Header Section */}
      <PaddingContainer style={styles.headerPadding}>
        <FlexContainer direction="row" position="rowBetween">
          <QuickActionButton onPress={() => navigation.goBack()}>
            <ArrowIcon fill={AppColors.GreyDark} height={12} width={12} />
          </QuickActionButton>

          <AppText fontSize="large" fontFamily="ManropeBold">
            Categories
          </AppText>

          <View style={styles.headerSpacer} />
        </FlexContainer>
      </PaddingContainer>

      <Spacer space={20} />

      {loading ? (
        <FlexContainer position="center" fillHeight>
          <ActivityIndicator color={AppColors.PrimaryBlue} size="large" />
        </FlexContainer>
      ) : (
        <FlatList
          data={categories}
          keyExtractor={item => item.slug}
          renderItem={renderCategoryItem}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <FlexContainer position="center">
              <AppText>No categories found</AppText>
            </FlexContainer>
          }
        />
      )}
    </MainContainer>
  );
};

export default CategoriesScreen;

const styles = StyleSheet.create({
  headerPadding: {
    paddingVertical: 10,
  },
  headerSpacer: {
    width: 40,
  },
  listContent: {
    paddingHorizontal: 12,
    paddingBottom: 30,
  },
  categoryCard: {
    flex: 1,
    backgroundColor: AppColors.PureWhite,
    margin: 8,
    paddingVertical: 25,
    paddingHorizontal: 10,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F6F6F6',
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F0F5FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  categoryName: {
    textAlign: 'center',
    textTransform: 'capitalize',
  },
});
