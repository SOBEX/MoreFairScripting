#include<algorithm>
#include<chrono>
#include<cmath>
#include<functional>
#include<iostream>
#include<map>
#include<optional>
#include<sstream>
#include<string>
#include<vector>
void injectArguments(){
	static std::stringstream arguments;
	arguments<<R"RAW(41894 19 5439311212 19
1 1 57630 4 3 105334 224769705 (30)♣ Moose Guest 🌈🌑
1 2 1802 4 3 51933 193555273 (486)♟ SophieZzz 🌈🌚
1 3 52114 5 3 150797 131334720 (184)♤ Muldeh🌈🌑
1 4 41942 5 3 130310 124045136 (91)♥ Pingwin
1 5 58175 4 3 138683 111207298 Laaria 🌈
1 6 37916 2 3 109940 101355791 (228)♧ Gianteater Ant 🐜🌈🌑
1 7 4 3 3 88434 90304496 (48)♣ Kali 🌈🌘 (probably busy coding)
1 8 38611 2 2 57044 67366379 (3) Far
1 9 54958 5 3 151838 49922480 (335)♡ General Consensus 🌈🌘
1 10 43978 2 3 97314 41714807 (297)♡ 📱MobileChecker 🌈🌑
1 11 54963 5 3 146478 40732363 (366)♢ Lola 🌈🌑
1 12 57020 5 3 115599 20438476 (88)♥ Malice🌈🌘
1 13 56289 0 4 20181 3506539 (3) KingsGambit
1 14 58129 0 4 12793 1323946 Mystery Guest
1 15 39781 0 4 12710 1323872 (305)♡ Gottlieb🌈🌚
1 16 58108 0 4 8291 514743 death
1 17 49941 4 2 7342 381691 (273)♧ Sylvia
1 18 53741 0 2 768 8665 (235)♧ Psychemaster 🌈🌚
1 19 41894 0 4 72 72 (314)♡ SOBEX 🌈🌚
)RAW";
	std::cin.rdbuf(arguments.rdbuf());
}
using smaller=int16_t;
using longest=int64_t;
using seconds=std::chrono::seconds;
using minutes=std::chrono::minutes;
using hours=std::chrono::hours;
using days=std::chrono::days;
using std::chrono::duration_cast;
using Time=seconds;
static constexpr Time zero=seconds::zero();
static constexpr Time oneSecond=seconds(1);
static constexpr Time oneMinute=duration_cast<seconds>(minutes(1));
static constexpr Time oneHour=duration_cast<seconds>(hours(1));
static constexpr Time oneDay=duration_cast<seconds>(days(1));
Time getTime(seconds s=seconds::zero(),minutes m=minutes::zero(),hours h=hours::zero(),days d=days::zero()){
	return s+duration_cast<seconds>(m)+duration_cast<seconds>(h)+duration_cast<seconds>(d);
}
std::ostream&printTime(Time t){
	using namespace std::chrono;
	seconds s=t;
	minutes m=duration_cast<minutes>(s);
	if(m!=minutes::zero()){
		s-=duration_cast<seconds>(m);
		hours h=duration_cast<hours>(m);
		if(h!=hours::zero()){
			m-=duration_cast<minutes>(h);
			days d=duration_cast<days>(h);
			if(d!=days::zero()){
				h-=duration_cast<hours>(d);
				std::cout<<d<<' ';
			}
			std::cout<<h<<' ';
		}
		std::cout<<m<<' ';
	}
	return std::cout<<s;
}
struct Ranker{
	bool growing=false;
	int accountId=-1;
	int bias=0;
	int multiplier=0;
	longest power=0;
	longest points=0;
	int read(){
		int rank;
		std::cin>>growing>>rank>>accountId>>bias>>multiplier>>power>>points;
		std::cin.ignore(1,'\t');
		return rank;
	}
	void print(int rank,const std::string&username)const{
		std::cout<<rank;
		if(!growing){
			std::cout<<'!';
		}
		std::cout<<'\t'<<'['<<'+'<<bias<<' '<<'x'<<multiplier<<']'<<'\t'<<power<<'\t'<<points<<'\t'<<username<<'#'<<accountId<<'\n';
	}
};
constexpr auto a=sizeof(Ranker);
struct Data{
	int selfId=-1;
	int ladder=1;
	longest pointRequirement=0;
	int rankerCount=0;
	std::map<int,std::string>names;
#if false
	static constexpr int maxRankerCount=196;
	Ranker rankers[maxRankerCount];
	void read(){
		std::cin>>selfId>>ladder>>rankerCount;
		if(rankerCount>maxRankerCount){
			rankerCount=maxRankerCount;
		}
#else
	static constexpr int maxRankerCount=1024;
	std::vector<Ranker>rankers;
	void read(){
		std::cin>>selfId>>ladder>>pointRequirement>>rankerCount;
		if(rankerCount>maxRankerCount){
			rankerCount=maxRankerCount;
		}
		rankers.resize(rankerCount);
#endif
		for(int i=0;i<rankerCount;i++){
			Ranker cur;
			int rank=cur.read();
			rankers[rank-1]=cur;
			std::string username;
			std::getline(std::cin,username);
			names.emplace(cur.accountId,username);

		}
		//TODO remove lines after maxRankerCount
	}
	void print(int i)const{
		rankers[i].print(i+1,names.find(rankers[i].accountId)->second);
	}
	void print()const{
		for(int i=0;i<rankerCount;i++){
			print(i);
		}
	}
	void sort(){
#if false
		std::stable_sort(rankers,rankers+rankerCount,[](const Ranker &l,const Ranker &r){return l.points>r.points;});
#else
		bool swapped;
		for(int i=0;i<rankerCount-1;i++){
			swapped=false;
			for(int j=0;j<rankerCount-i-1;j++){
				if(rankers[j].points<rankers[j+1].points){
					std::swap(rankers[j],rankers[j+1]);
					swapped=true;
				}
			}
			if(swapped==false)
				break;
		}
#endif
	}
	Ranker &find(int id=-1){
		if(id==-1){
			id=selfId;
		}
		for(int i=0;i<rankerCount;i++){
			if(rankers[i].accountId==id){
				return rankers[i];
			}
		}
		throw id;
	}
	const Ranker &find(int id=-1)const{
		if(id==-1){
			id=selfId;
		}
		for(int i=0;i<rankerCount;i++){
			if(rankers[i].accountId==id){
				return rankers[i];
			}
		}
		throw id;
	}
	void multiplier(int id=-1){
		Ranker &cur=find(id);
		cur.multiplier++;
		cur.bias=0;
		cur.points=0;
		cur.power=0;
		sort();
		return;
	}
	void bias(int id=-1){
		Ranker &cur=find(id);
		cur.bias++;
		cur.points=0;
		sort();
		return;
	}
	longest nextCost(int n)const{
		longest cost=1;
		while(n-->=0){
			cost*=ladder+1;
		}
		return cost;
	}
	void simulateSingle(){
		if(rankers[0].growing){
			rankers[0].points+=rankers[0].power;
		}
		for(int i=1;i<rankerCount;i++){
			Ranker &cur=rankers[i];
			if(cur.growing){
				longest power=cur.power+(i+cur.bias)*cur.multiplier;
				cur.power=power;
				cur.points+=power;
				for(int j=i;j!=0&&rankers[j].points>rankers[j-1].points;j--){
					std::swap(rankers[j],rankers[j-1]);
				}
			}
		}
		if(rankers[0].points>=pointRequirement){
			rankers[0].growing=false;
		}
	}
	void simulateTime(Time t){
		while(t>zero){
			simulateSingle();
			t-=oneSecond;
		}
	}
	Time simulateUntil(std::function<bool(const Data &)>condition){
		Time t=oneDay;
		while(t>zero&&!condition(*this)){
			simulateSingle();
			t-=oneSecond;
		}
		return oneDay-t;
	}
};
namespace condition{
	using namespace std::placeholders;
	using ft=std::function<bool(const Data &)>;
	bool _combineAnd(const Data &data,ft l,ft r){
		return l(data)&&r(data);
	}
	bool _combineOr(const Data &data,ft l,ft r){
		return l(data)&&r(data);
	}
	bool _nextFirst(const Data &data,int id){
		return data.rankers[0].accountId!=id;
	}
	bool _nextPromote(const Data &data,int id){
		return data.rankers[0].accountId!=id&&data.rankers[0].growing==false;
	}
	bool _idFirst(const Data &data,int id){
		return data.find(id).accountId==data.rankers[0].accountId;
	}
	bool _idPromote(const Data &data,int id){
		return data.find(id).growing==false;
	}
	bool _idMultiplier(const Data &data,int id){
		const Ranker &cur=data.find(id);return cur.power>=data.nextCost(cur.multiplier);
	}
	bool _idBias(const Data &data,int id){
		const Ranker &cur=data.find(id);return cur.points>=data.nextCost(cur.bias);
	}
	ft combineAnd(ft l,ft r){
		return std::bind(_combineAnd,_1,l,r);
	}
	ft combineOr(ft l,ft r){
		return std::bind(_combineOr,_1,l,r);
	}
	ft nextFirst(const Data &data){
		return std::bind(_nextFirst,_1,data.rankers[0].accountId);
	}
	ft nextPromote(const Data &data){
		return std::bind(_nextPromote,_1,data.rankers[0].growing?-1:data.rankers[0].accountId);
	}
	ft idFirst(int id){
		return std::bind(_idFirst,_1,id);
	}
	ft idPromote(int id){
		return std::bind(_idPromote,_1,id);
	}
	ft idNextMultiplier(int id){
		return std::bind(_idMultiplier,_1,id);
	}
	ft idNextBias(int id){
		return std::bind(_idBias,_1,id);
	}
	ft selfFirst(){
		return std::bind(_idFirst,_1,-1);
	}
	ft selfPromote(){
		return std::bind(_idPromote,_1,-1);
	}
	ft selfNextMultiplier(){
		return std::bind(_idMultiplier,_1,-1);
	}
	ft selfNextBias(){
		return std::bind(_idBias,_1,-1);
	}
}
std::optional<Time> solveSingleBiasTimeUntil(Data data,condition::ft condition=condition::selfPromote(),const int id=-1,const int minBias=0){
	Time bestTimeToPromote=oneDay;
	Time bestTimeToBias=oneDay;
	Time end;
	{
		Data copy(data);
		end=copy.simulateUntil(condition);
		if(data.find(id).bias>=minBias)bestTimeToPromote=end;
	}
	Time start;
	start=data.simulateUntil(condition::idNextBias(id));
	for(Time now=start;now<end;data.simulateTime(oneMinute),now+=oneMinute){
		Data copy(data);
		copy.bias(id);
		Time cur=now+copy.simulateUntil(condition);
		if(cur<=bestTimeToPromote){
			bestTimeToPromote=cur;
			bestTimeToBias=now;
		}
	}
	if(bestTimeToBias==oneDay){
		return std::optional<Time>();
	}
	return bestTimeToBias;
}
std::optional<Time> solveBiasTimeUntil(Data data,condition::ft condition=condition::selfPromote(),const int id=-1,const int minBias=0){
	Time bestTimeToPromote=oneDay;
	Time bestTimeToBias=oneDay;
	Time end;
	{
		Data copy(data);
		end=copy.simulateUntil(condition);
		if(data.find(id).bias>=minBias)bestTimeToPromote=end;
	}
	Time start;
	start=data.simulateUntil(condition::idNextBias(id));
	for(Time now=start;now<end;data.simulateTime(oneMinute),now+=oneMinute){
		Data copy(data);
		copy.bias(id);
		Time cur=now;
		for(std::optional<Time>next=solveSingleBiasTimeUntil(copy,condition,id,minBias);next.has_value();next=solveSingleBiasTimeUntil(copy,condition,id,minBias)){
			copy.simulateTime(next.value());
			cur+=next.value();
			copy.bias(id);
		}
		cur+=copy.simulateUntil(condition);
		if(cur<=bestTimeToPromote){
			bestTimeToPromote=cur;
			bestTimeToBias=now;
		}
	}
	if(bestTimeToBias==oneDay){
		return std::optional<Time>();
	}
	return bestTimeToBias;
}
void printBiasTimes(Data data,int id=-1){
	int maxMinutes;
	{
		Data copy(data);
		Time timeUntilFirst=copy.simulateUntil(condition::idFirst(id));
		Time timeUntilPromote=timeUntilFirst+copy.simulateUntil(condition::idPromote(id));
		std::cout<<"DONT BIAS First in: ";
		printTime(timeUntilFirst)<<", Promote in: ";
		printTime(timeUntilPromote)<<'\n';
		maxMinutes=duration_cast<minutes>(timeUntilPromote-oneSecond).count();
	}
	{
		Data copy(data);
		copy.bias();
		Time timeUntilFirst=copy.simulateUntil(condition::idFirst(id));
		Time timeUntilPromote=timeUntilFirst+copy.simulateUntil(condition::idPromote(id));
		std::cout<<"BIAS ASAP First in: ";
		printTime(timeUntilFirst)<<", Promote in: ";
		printTime(timeUntilPromote)<<'\n';
	}
	for(int minutes=1;minutes<=maxMinutes;minutes++){
		data.simulateTime(oneMinute);
		Data cur(data);
		cur.bias();
		Time timeUntilFirst=(oneMinute*minutes)+cur.simulateUntil(condition::idFirst(id));
		Time timeUntilPromote=timeUntilFirst+cur.simulateUntil(condition::idPromote(id));
		std::cout<<"BIAS ";
		if(minutes<100){
			std::cout<<' ';
			if(minutes<10){
				std::cout<<' ';
			}
		}
		std::cout<<minutes<<"M First in: ";
		printTime(timeUntilFirst)<<", Promote in: ";
		printTime(timeUntilPromote)<<'\n';
	}
}
void printETA(Data data){
	Time total(0);
	int rank=0;
	int i=data.rankerCount-1;
	while(true){
		while(!data.rankers[i].growing){
			if(i==0){
				std::cout<<'\n';
				return;
			}
			i--;
		}
		total=total+data.simulateUntil(condition::nextPromote(data));
		printTime(total)<<'\t';
		data.rankers[0].print(++rank,data.names.find(data.rankers[0].accountId)->second);
	}
}
void printETABias(){
	std::cout<<"TODO\n\n";//TODO
	//vector of tuples with ranker copy (old values idc) and solveTimeBias, sort by time, print
}
void skipToNextMultiplier(Data &data){
	printTime(data.simulateUntil(condition::selfNextMultiplier()))<<'\n';
	data.multiplier();
}
void skipToNextBias(Data &data){
	printTime(data.simulateUntil(condition::selfNextBias()))<<'\n';
	data.bias();
}
int main(){
	while(true){
		//injectArguments();
		Data original;
		original.read();
		auto start=std::chrono::high_resolution_clock::now();

		enum class Choice{
			Simple,Multiplier,Promote,Promote7Bias
		}choice=Choice::Promote7Bias;
		switch(choice){
		case Choice::Simple:
			printETA(original);
			skipToNextBias(original);
			printETA(original);
			break;
		case Choice::Multiplier:
			printBiasTimes(original);
			printETA(original);
			std::cout<<"Single Bias to Multi in ";printTime(solveSingleBiasTimeUntil(original,condition::selfNextMultiplier()).value_or(oneDay*365))<<'\n';
			std::cout<<"Complex Bias to Multi in ";printTime(solveBiasTimeUntil(original,condition::selfNextMultiplier()).value_or(oneDay*365))<<'\n';
			skipToNextBias(original);
			printETA(original);
			break;
		case Choice::Promote:
			printBiasTimes(original);
			printETA(original);
			std::cout<<"Single Bias to Promote in ";printTime(solveSingleBiasTimeUntil(original,condition::selfPromote()).value_or(oneDay*365))<<'\n';
			std::cout<<"Complex Bias to Promote in ";printTime(solveBiasTimeUntil(original,condition::selfPromote()).value_or(oneDay*365))<<'\n';
			skipToNextBias(original);
			printETA(original);
			break;
		case Choice::Promote7Bias:
			printBiasTimes(original);
			printETA(original);
			std::cout<<"Single Bias to Promote in ";printTime(solveSingleBiasTimeUntil(original,condition::selfPromote(),-1,7).value_or(oneDay*365))<<'\n';
			std::cout<<"Complex Bias to Promote in ";printTime(solveBiasTimeUntil(original,condition::selfPromote(),-1,7).value_or(oneDay*365))<<'\n';
			skipToNextBias(original);
			printETA(original);
			break;
		}
		//std::cout<<"Next Multi in ";printTime(original.simulateUntil(condition::selfNextMultiplier()))<<'\n';

		auto end=std::chrono::high_resolution_clock::now();
		auto duration=end-start;
		auto seconds=std::chrono::duration_cast<std::chrono::seconds>(duration);
		auto milliseconds=std::chrono::duration_cast<std::chrono::milliseconds>(duration-=seconds);
		auto nanoseconds=std::chrono::duration_cast<std::chrono::nanoseconds>(duration-=milliseconds);
		std::cout<<seconds<<' '<<milliseconds<<' '<<nanoseconds<<'\n';
	}
}
/*
optimize for biggest lead instead of fastest promote
guarantee going for last bias even if worse at the moment

split optimize to multi and promote
multi uses bias
promote uses multi and bias
special case: cant get enough power to multi before promote -> timeout
return tuple (time to bias next, predicted time until multi/promote)

printBiasTimes -> solveBias(verbose=true)


inline Data copy(){return Data(*this);}




multiple phases to select

need biases for multi
decide multi or promote
need biases for promote
last bias waiting -> simulate bias and show printETA
*/
