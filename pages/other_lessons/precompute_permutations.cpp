vector <int> perm;
int fact[13],ans[13];
int main () {
    fstream fout("answers.txt",ios::out);
    int n,i,rem,max;
    cin >> n ;
    fact[0]=1;
    for (i=1; i<=n; i++) {
        perm.push_back(i);
        fact[i]=i*fact[i-1];
    }
    do {
        rem=0; max=-1;
        for (i=0; i<n; i++) {
            if (perm[i]<10) rem*=10;
            else rem*=100;
            rem+=perm[i];
            rem%=11;
            if (max<perm[i]) max=perm[i];
            if ((rem==0)&&(max==i+1)) ans[i+1]++;
        }
    } while (next_permutation(perm.begin(),perm.end()));
    fout << "{";
    for (i=1; i<=n; i++) {
        fout << ans[i]/fact[n-i] ;
        if (i!=n) fout << ",";
    }
    fout << "}";
    cout << endl ;
    return 0;
}