long long int hash=0;
for (int i=0; i<s.size(); i++) {
    hash*=p; hash+=s[i];
    hash%=m;
}