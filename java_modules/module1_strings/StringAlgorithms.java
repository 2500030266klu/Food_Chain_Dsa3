package module1_strings;

import java.util.ArrayList;
import java.util.List;

/**
 * Module 1: String Algorithms
 * - Knuth-Morris-Pratt (KMP) Pattern Searching: O(n + m)
 * - Rabin-Karp Rolling Hash: Average O(n + m), Worst O(n * m)
 */
public class StringAlgorithms {

    public static List<Integer> kmpSearch(String text, String pattern) {
        List<Integer> result = new ArrayList<>();
        if (pattern == null || pattern.isEmpty() || text == null) return result;

        int[] lps = new int[pattern.length()];
        for (int i = 1, len = 0; i < pattern.length(); ) {
            if (pattern.charAt(i) == pattern.charAt(len)) lps[i++] = ++len;
            else if (len != 0) len = lps[len - 1];
            else lps[i++] = 0;
        }

        for (int i = 0, j = 0; i < text.length(); ) {
            if (pattern.charAt(j) == text.charAt(i)) { i++; j++; }
            if (j == pattern.length()) {
                result.add(i - j);
                j = lps[j - 1];
            } else if (i < text.length() && pattern.charAt(j) != text.charAt(i)) {
                if (j != 0) j = lps[j - 1];
                else i++;
            }
        }
        return result;
    }

    public static List<Integer> rabinKarpSearch(String text, String pattern) {
        List<Integer> result = new ArrayList<>();
        int d = 256;
        int q = 101;
        int m = pattern.length(), n = text.length();
        if (m > n || m == 0) return result;

        int pHash = 0, tHash = 0, h = 1;
        for (int i = 0; i < m - 1; i++) h = (h * d) % q;

        for (int i = 0; i < m; i++) {
            pHash = (d * pHash + pattern.charAt(i)) % q;
            tHash = (d * tHash + text.charAt(i)) % q;
        }

        for (int i = 0; i <= n - m; i++) {
            if (pHash == tHash) {
                boolean match = true;
                for (int j = 0; j < m; j++) {
                    if (text.charAt(i + j) != pattern.charAt(j)) {
                        match = false; break;
                    }
                }
                if (match) result.add(i);
            }
            if (i < n - m) {
                tHash = (d * (tHash - text.charAt(i) * h) + text.charAt(i + m)) % q;
                if (tHash < 0) tHash += q;
            }
        }
        return result;
    }
}
