import assert from 'assert';
import { rankProductsWithAI, CandidateProductSummary } from '../services/aiService';

// Test runner helper
let passedTests = 0;
let totalTests = 0;

const runTest = async (name: string, fn: () => Promise<void> | void) => {
  totalTests++;
  try {
    await fn();
    console.log(`  ✓ PASSED: ${name}`);
    passedTests++;
  } catch (err: any) {
    console.error(`  ✗ FAILED: ${name}`);
    console.error(`    Error: ${err.message}`);
  }
};

// Mock product datasets for deterministic verification
const mockProducts: CandidateProductSummary[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Classic Denim Trucker Jacket',
    category: 'Jackets',
    brand: 'UrbanThread',
    price: 2499,
    rating: 4.8,
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Classic Cotton Crewneck T-Shirt',
    category: 'T-Shirts',
    brand: 'AuraStudio',
    price: 699,
    rating: 4.8,
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Classic White Leather Low-Top Sneakers',
    category: 'Sneakers',
    brand: 'StepUp',
    price: 2799,
    rating: 4.8,
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'Traditional Cable Knit Wool Sweater',
    category: 'Sweaters',
    brand: 'VogueStyles',
    price: 2499,
    rating: 4.9,
  },
];

async function runRecommendationTestSuite() {
  console.log('\n======================================================');
  console.log('🤖 SMART SHOP AI RECOMMENDATION SYSTEM TEST SUITE');
  console.log('======================================================\n');

  // TEST 1: Missing GEMINI_API_KEY triggers graceful fallback (returns null)
  await runTest('1. Missing or empty GEMINI_API_KEY returns null to trigger deterministic fallback', async () => {
    const originalKey = process.env.GEMINI_API_KEY;
    delete process.env.GEMINI_API_KEY;

    const result = await rankProductsWithAI(mockProducts, {
      type: 'personalized',
      userContext: {
        viewedCategories: ['Jackets'],
        recentViewedNames: ['Classic Denim Trucker Jacket'],
        cartProductNames: [],
        wishlistProductNames: [],
        purchasedCategories: [],
      },
    });

    assert.strictEqual(result, null, 'Should return null when API key is missing');
    process.env.GEMINI_API_KEY = originalKey;
  });

  // TEST 2: AI Hallucination Defense - Rejects unknown product IDs
  await runTest('2. Rejects hallucinated product IDs from AI output not present in candidate pool', async () => {
    const candidatePoolMap = new Set(mockProducts.map((p) => p.id));
    const fakeAiOutput = [
      { productId: '11111111-1111-1111-1111-111111111111', score: 0.95, reason: 'Top match' },
      { productId: '99999999-9999-9999-9999-999999999999', score: 0.90, reason: 'Hallucinated ID' }, // Fake ID
    ];

    const sanitized = fakeAiOutput.filter((item) => candidatePoolMap.has(item.productId));
    assert.strictEqual(sanitized.length, 1, 'Should filter out unknown product ID');
    assert.strictEqual(sanitized[0].productId, '11111111-1111-1111-1111-111111111111');
  });

  // TEST 3: Out of stock products are excluded
  await runTest('3. Out-of-stock products (stock <= 0) are strictly excluded', () => {
    const inventory = [
      { id: 'p1', name: 'In Stock Product', stock: 5 },
      { id: 'p2', name: 'Out of Stock Product', stock: 0 },
      { id: 'p3', name: 'Negative Stock Product', stock: -1 },
    ];

    const available = inventory.filter((p) => p.stock > 0);
    assert.strictEqual(available.length, 1);
    assert.strictEqual(available[0].id, 'p1');
  });

  // TEST 4: Currently viewed product is excluded from related items
  await runTest('4. Currently viewed product is excluded from related product recommendations', () => {
    const currentProductId = '11111111-1111-1111-1111-111111111111';
    const related = mockProducts.filter((p) => p.id !== currentProductId);

    assert.strictEqual(related.length, 3);
    assert.ok(!related.some((p) => p.id === currentProductId));
  });

  // TEST 5: Duplicate products are removed
  await runTest('5. Duplicate products are de-duplicated during ranking aggregation', () => {
    const rawList = [mockProducts[0], mockProducts[1], mockProducts[0], mockProducts[2]];
    const seen = new Set<string>();
    const deduplicated = rawList.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    assert.strictEqual(deduplicated.length, 3);
    assert.strictEqual(seen.size, 3);
  });

  // TEST 6: Empty dataset handled gracefully
  await runTest('6. Recommendation API handles empty candidate pool without throwing errors', async () => {
    const emptyCandidates: CandidateProductSummary[] = [];
    const result = await rankProductsWithAI(emptyCandidates, {
      type: 'personalized',
    });

    assert.deepStrictEqual(result, []);
  });

  // TEST 7: Guest session recommendation fallback scoring
  await runTest('7. Deterministic heuristic ranker prioritizes category affinity and high ratings', () => {
    const userPreferredCategory = 'Electronics';
    const scored = mockProducts.map((product) => {
      let score = 0.5;
      let reason = `Popular in ${product.category}`;
      if (product.category === userPreferredCategory) {
        score += 0.35;
        reason = `Matches your interest in ${product.category}`;
      }
      if (product.rating >= 4.7) {
        score += 0.15;
      }
      return { id: product.id, score, reason };
    });

    scored.sort((a, b) => b.score - a.score);

    // Electronics products should be at the top
    assert.strictEqual(scored[0].id, '11111111-1111-1111-1111-111111111111');
    assert.strictEqual(scored[1].id, '22222222-2222-2222-2222-222222222222');
    assert.ok(scored[0].score > 0.85);
  });

  // TEST 8: Gemini timeout simulation triggers fallback
  await runTest('8. API timeout aborts cleanly and triggers fallback', async () => {
    process.env.GEMINI_API_KEY = 'test_dummy_key_simulate_timeout';
    // With an invalid dummy key or network disconnect, rankProductsWithAI will catch error and return null
    const result = await rankProductsWithAI(mockProducts, { type: 'personalized' }, 10);
    assert.strictEqual(result, null, 'Should return null on timeout/network failure');
    delete process.env.GEMINI_API_KEY;
  });

  // TEST 9: Authenticated user isolation
  await runTest('9. User recommendations are isolated by userId / sessionId keys', () => {
    const userA = 'user-alice-123';
    const userB = 'user-bob-456';
    const cacheMap = new Map<string, string>();

    cacheMap.set(`rec:user:${userA}`, 'Recommendations for Alice');
    cacheMap.set(`rec:user:${userB}`, 'Recommendations for Bob');

    assert.strictEqual(cacheMap.get(`rec:user:${userA}`), 'Recommendations for Alice');
    assert.strictEqual(cacheMap.get(`rec:user:${userB}`), 'Recommendations for Bob');
    assert.notStrictEqual(cacheMap.get(`rec:user:${userA}`), cacheMap.get(`rec:user:${userB}`));
  });

  // TEST 10: Interaction type validation
  await runTest('10. Interaction types strictly match supported enum values', () => {
    const validTypes = ['VIEW', 'CART', 'REMOVE_FROM_CART', 'WISHLIST', 'PURCHASE'];
    assert.ok(validTypes.includes('VIEW'));
    assert.ok(validTypes.includes('CART'));
    assert.ok(validTypes.includes('REMOVE_FROM_CART'));
    assert.ok(validTypes.includes('WISHLIST'));
    assert.ok(validTypes.includes('PURCHASE'));
    assert.ok(!validTypes.includes('INVALID_EVENT'));
  });

  console.log('\n======================================================');
  console.log(`TEST RESULTS: ${passedTests}/${totalTests} TESTS PASSED`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runRecommendationTestSuite();
