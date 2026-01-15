type AppScreensParamsList = {
  HomeScreen: undefined;
  CategoriesScreen: undefined;
  FavoritesScreen: undefined;
  MoreScreen: undefined;
  ProductDetails: {product: ProductType};
  Cart: undefined;
  BottomNavBar: undefined;
  CategoryProductsScreen: {
    categoryId: number;
    categoryName: string;
  };
  InvoiceScreen: { order: any };
};

type ProductType = {
  id: number;
  title: string;
  description: string;
  price: number;
  discountPercentage?: number;
  rating?: number;
  stock: number;
  brand: string;
  category: string;
  thumbnail: string;
  images: string[];
  isFavorite: boolean;
};

type ProductsList = ProductType[];

export type {AppScreensParamsList, ProductType, ProductsList};
