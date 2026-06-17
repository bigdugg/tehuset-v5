import site from '../content/site.json';
import menuSv from '../content/menu-sv.json';
import menuEn from '../content/menu-en.json';
import productsData from '../content/products.json';
import { TehusetHome } from '../components/TehusetHome';
import type { MenuContent, Product, SiteContent } from '../components/types';

export default function Home() {
  return <TehusetHome site={site as SiteContent} menuSv={menuSv as MenuContent} menuEn={menuEn as MenuContent} products={productsData.products as Product[]} />;
}
