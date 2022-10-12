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
	arguments<<R"RAW(41894	20	50
1	1	37687	4	4	542322	2994708531	mateo
1	2	41338	6	4	956386	2862840095	(2)♣ Aaaaaaaaaaaaaaaaaaaaaaaa
1	3	41068	6	4	960991	2831417750	(1)♠ Boozle
1	4	42832	6	4	958852	2810254837	[blue] tecnetan (sleeping)
1	5	290	6	4	669209	2657406831	Known Guest 13
1	6	43484	6	4	972026	2555873876	(2)♣ Celer
1	7	41636	6	4	1029244	2550423004	(2)♣ 🐘 Heph 💦
1	8	526	6	4	900132	2433155799	(2)♣ doshMobile
1	9	43698	7	4	1019443	2316076191	EricTheUnready
1	10	1802	6	4	1020590	2264937506	(2)♣ Sophie
1	11	41251	0	4	337471	2262023085	tmike 👁💋👁
1	12	43443	6	4	1006185	2226769965	Katie (afk) A20
1	13	41356	0	3	384915	2072826181	(1)♠ oilplank
1	14	41838	1	4	653679	2032466554	Doc519 A18
1	15	42379	6	4	982540	1909803384	Logiar (⚙️20)
1	16	43006	7	4	869113	1758774502	BoCK A20
1	17	1512	5	4	1016166	1697615267	(5)♤ tree
1	18	40847	6	4	1007475	1671324938	(1)♠ Gilfoyle 🖥️
1	19	68	4	4	648990	1477729926	(3)♥ Gawr Gura
1	20	41942	2	2	233502	1476962760	Pingwin
1	21	41484	0	1	207304	1376066645	Mys T. Guest
1	22	37644	0	2	242716	1357853195	(3)♥ Space 🇺🇦 Dandy
1	23	1620	0	1	200617	1341413062	Korben
1	24	1061	7	4	1078963	1324447856	(3)♥ � �🍇 SendMoreGrapes - A20
1	25	40360	0	1	203928	1294456629	Ladders
1	26	43732	0	1	204645	1293640537	Nope [A19 zZz]
1	27	38709	0	1	205785	1287947234	lila uwu
1	28	481	0	1	208400	1286775426	(5)♤ Elara Zombiekiller
1	29	41176	0	1	207472	1286584075	Oligor
1	30	38589	0	1	207490	1286572626	(1)♠ RoyB | 🇺🇦
1	31	43791	0	1	205785	1284975051	Willd | A19
1	32	37772	0	1	206229	1278536154	(1)♠ Orns
1	33	1053	6	4	875925	1008832790	(9)♟ Turtle
1	34	40882	6	4	798993	995643599	(1)♠ To the 🌑
1	35	40547	7	4	1094323	826918502	(1)♠ dero
1	36	39115	0	3	385051	626705502	(6)♧ Zilvarro
1	37	42680	0	3	378534	588001257	(1)♠ poopy
1	38	1341	0	3	347389	478324843	(3)♥ The ❓ Guest - asleep A19
1	39	20798	0	1	190881	455453222	mino (sad)
1	40	1757	2	3	344828	393441188	(2)♣ MonkeyMarkMario (🙉✔️👲)
1	41	2213	5	4	748264	343547444	(1)♠ eta / Pancakes 🥞
1	42	37916	3	4	395056	329719933	(2)♣ Gianteater Ant 🐜
1	43	37726	6	4	470604	296767417	(2)♣ Coyote151sleepauto16
1	44	42284	1	4	423894	181241768	ℕ⍥&dagger; ℂℍᾶḋ
1	45	2800	2	3	177593	107521947	Softly Falling Rain - A20
1	46	38743	4	4	855604	89608091	(1)♠ balazamon0
1	47	1328	0	4	171037	76512556	(3)♥  Lurker DUCKS
1	48	37169	7	4	398413	62835347	(1)♠ Artist formerly known as 12
1	49	2632	3	2	20961	2127379	(2)♣ Missingno
1	50	41894	2	4	9441	187275	(2)♣ SOBEX|AFK-ping before grape
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
std::optional<Time> solveSingleBiasTimeUntil(Data data,condition::ft condition=condition::selfPromote(),const int id=-1){
	Time bestTimeToPromote=oneDay;
	Time bestTimeToBias=oneDay;
	Time end;
	{
		Data copy(data);
		end=copy.simulateUntil(condition);
		bestTimeToPromote=end;
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
std::optional<Time> solveBiasTimeUntil(Data data,condition::ft condition=condition::selfPromote(),const int id=-1){
	Time bestTimeToPromote=oneDay;
	Time bestTimeToBias=oneDay;
	Time end;
	{
		Data copy(data);
		end=copy.simulateUntil(condition);
		bestTimeToPromote=end;
	}
	Time start;
	start=data.simulateUntil(condition::idNextBias(id));
	for(Time now=start;now<end;data.simulateTime(oneMinute),now+=oneMinute){
		Data copy(data);
		copy.bias(id);
		Time cur=now;
		for(std::optional<Time>next=solveSingleBiasTimeUntil(copy,condition,id);next.has_value();next=solveSingleBiasTimeUntil(copy,condition,id)){
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
			Simple,Multiplier,Promote,Both
		}choice=Choice::Promote;
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
		case Choice::Both:
			printBiasTimes(original);
			printETA(original);
			std::cout<<"Single Bias to Multi in ";printTime(solveSingleBiasTimeUntil(original,condition::selfNextMultiplier()).value_or(oneDay*365))<<'\n';
			std::cout<<"Complex Bias to Multi in ";printTime(solveBiasTimeUntil(original,condition::selfNextMultiplier()).value_or(oneDay*365))<<'\n';
			std::cout<<"Single Bias to Promote in ";printTime(solveSingleBiasTimeUntil(original,condition::selfPromote()).value_or(oneDay*365))<<'\n';
			std::cout<<"Complex Bias to Promote in ";printTime(solveBiasTimeUntil(original,condition::selfPromote()).value_or(oneDay*365))<<'\n';
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
split optimze to multi and promote
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
