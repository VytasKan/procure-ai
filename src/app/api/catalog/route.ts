import { NextRequest, NextResponse } from 'next/server';
import { CatalogService } from '@/backend/services/catalog-service';
import { hasChannel3ApiKey } from '@/backend/config/env';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const q = req.nextUrl.searchParams.get('q') || '';
    const productId = req.nextUrl.searchParams.get('id') || '';
    const category = req.nextUrl.searchParams.get('category') || undefined;
    const quantityStr = req.nextUrl.searchParams.get('quantity') || '100';
    const quantity = parseInt(quantityStr, 10) || 100;
    const isLive = hasChannel3ApiKey();

    // Step 2 Details Endpoint (/api/catalog?id=...)
    if (productId) {
      const details = await CatalogService.getProductDetails(productId);
      if (!details) {
        return NextResponse.json({ error: 'Product not found' }, { status: 404 });
      }
      return NextResponse.json({
        isLive,
        product: {
          ...details,
          requestedQuantity: quantity,
          totalPrice: Math.round(details.price * quantity * 100) / 100
        }
      });
    }

    // Step 1 Search Endpoint (/api/catalog?q=...)
    let products = [];
    if (q) {
      products = await CatalogService.searchAsync(q, {
        category,
        quantity,
        limit: 12
      });
    } else {
      products = await CatalogService.getInitialCatalog(quantity);
    }

    return NextResponse.json({
      isLive,
      count: products.length,
      quantity,
      products
    });
  } catch (error) {
    console.error('Catalog route error:', error);
    return NextResponse.json({ error: 'Failed to query catalog' }, { status: 500 });
  }
}
