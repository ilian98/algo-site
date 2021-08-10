int bit (int mask, int pos) {
    return mask&(1<<pos)?1:0;
}
long long int T[MAXK][MAXK];
int k;
int main () {
    int n,m;
    cin >> n >> m ;
    vector <int> profiles;
    for (int mask=0; mask<(1<<n); mask++) { /// приемаме, че 0 означава бяла клетка, а 1 - черна
        int i;
        for (i=1; i<n; i++) {
            if ((bit(mask,i)==1)&&(bit(mask,i-1)==1)) break; /// проверяваме дали профилът е валиден
        }
        if (i==n) profiles.push_back(mask);
    }
    k=profiles.size();
    for (int l=0; l<k; l++) {
        for (int r=0; r<k; r++) {
            /// може и по-бързо да направим тази проверка, като просто сравним profiles[l]&profiles[r] с 0
            int i;
            for (i=0; i<n; i++) {
                if ((bit(profiles[l],i)==1)&&(bit(profiles[r],i)==1)) break;
            }
            if (i==n) T[l][r]=1;
            else T[l][r]=0;
        }
    }
    ...
}
