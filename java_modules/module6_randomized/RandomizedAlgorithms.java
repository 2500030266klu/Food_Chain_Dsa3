package module6_randomized;

import java.util.Random;

/**
 * Module 6: Randomised Algorithms
 * - Miller-Rabin Primality Test: O(k * log^3 n)
 * - Reservoir Sampling: O(N)
 */
public class RandomizedAlgorithms {

    public static boolean isPrimeMillerRabin(long n, int k) {
        if (n <= 1 || n == 4) return false;
        if (n <= 3) return true;

        long d = n - 1;
        while (d % 2 == 0) d /= 2;

        Random rand = new Random();
        for (int i = 0; i < k; i++) {
            long a = 2 + (Math.abs(rand.nextLong()) % (n - 4));
            if (!millerTest(d, n, a)) return false;
        }
        return true;
    }

    private static boolean millerTest(long d, long n, long a) {
        long x = powerMod(a, d, n);
        if (x == 1 || x == n - 1) return true;
        while (d != n - 1) {
            x = (x * x) % n;
            d *= 2;
            if (x == 1) return false;
            if (x == n - 1) return true;
        }
        return false;
    }

    private static long powerMod(long base, long exp, long mod) {
        long res = 1;
        base = base % mod;
        while (exp > 0) {
            if (exp % 2 == 1) res = (res * base) % mod;
            exp = exp >> 1;
            base = (base * base) % mod;
        }
        return res;
    }

    public static int[] reservoirSample(int[] stream, int k) {
        int[] reservoir = new int[k];
        Random rand = new Random();

        for (int i = 0; i < k && i < stream.length; i++) {
            reservoir[i] = stream[i];
        }

        for (int i = k; i < stream.length; i++) {
            int j = rand.nextInt(i + 1);
            if (j < k) reservoir[j] = stream[i];
        }
        return reservoir;
    }
}
