/// понеже всички профили са валидни, директно разглеждаме всички числа с \(n\) бита
for (int l=0; l<(1<<n); l++) {
    for (int r=0; r<(1<<n); r++) {
        T[l][r]=1;
        bool profiles[2][MAXN];
        for (int i=0; i<n; i++) {
            profiles[0][i]=bit(l,i);
            profiles[1][i]=bit(r,i);
            if (profiles[0][i]==1) {
                if (profiles[1][i]==1) {
                    T[l][r]=0;
                    break;
                }
                profiles[1][i]=2; /// маркираме, че тази клетка в десния профил е покрита с хоризонтално домино
            }
        }
        if (T[l][r]==0) continue;
        int cnt=0;
        for (int i=0; i<n; i++) {
            if (profiles[1][i]!=0) {
                if (cnt%2!=0) {
                    T[l][r]=0;
                    break;
                }
                cnt=0;
            }
            else cnt++;
        }
        if (cnt%2!=0) T[l][r]=0;
    }
}
