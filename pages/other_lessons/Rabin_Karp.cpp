const long long int mod=1e9+9,base=1009;
int main () {
    long long int hash1,hash2,pow;
    int n,m,i;
    string s,model;

    ios_base::sync_with_stdio(false);
    cin.tie(NULL); cout.tie(NULL);

    getline(cin,model); m=model.size();
    getline(cin,s); n=s.size();

    pow=1; hash1=0;
    for (i=0; i<m; i++) {
        pow*=base; pow%=mod;
        hash1*=base; hash1+=model[i];
        hash1%=mod;
    }

    hash2=0;
    for (i=0; i<n; i++) {
        hash2*=base; hash2+=s[i];
        hash2%=mod;
        if (i>=m) {
           hash2+=mod*mod; hash2-=pow*s[i-m];
           hash2%=mod;
        }
        if (hash2==hash1) {
           cout << "yes\n";
           return 0;
        }
    }
    cout << "no\n";
    return 0;
}