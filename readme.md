# Modules
## Import / Export
	Export default logger
	Import logger from './loger.js'

	export const TYPE_LOG = 'log'
	import {TYPE_LOG} from './logger.js'
	import * as constants from './logger.js'

## Enhance object literals

	var object = {name , status , getName(){}}
	var object1 = { [fieldName]: 'JS', [fieldPrice]: 1000 }

## Spread 

	Rest: lấy ra phần còn lại
	function logger(a, b, ...params){}; // params là rest

	Destructuring 
	function logger({name,price ...rest}){} // destructuring {} trong tham số
	function logger([a,b, ...rest]){}

	Toán tử spread giống với Rest (...)
	Nhưng dùng trc mảng sẽ bỏ đi dấu ngoặc 

	var arr1 = [1,2,3]
	var arr2 = [...arr1]

	Khi trùng key thì nó sẽ lấy thuộc tính đc định nghĩa gần nhất

## Destructuring
	Lấy trực tiếp các phần tử trong một mảng
	var [a,b,c] = array;
	var {a,b,c} = object // lấy ra đúng tên
	var {a,,c} = object; // lấy ra đúng tên
	var {a,...rest} = object;
	var {name:name1 , children: {name1}} = course; // trong object có một object khác
	var {name , des = "default"} = object;

## Document.CreateElement()
	var h1 = document.createElement("h1");
	document.body.appendChild(h1);

## React.CreateElement()
	React.createElement(type,props,children, n);
	var h1 = React.createElement("h1", {title: "hello", className: "Hihi"} , "Heello guys" ); // tham so t3 la noi dung
	var ul = React.createElement("ul");
	var li1 = React.createElement("li");
	var li2 = React.createElement("li");

	ul.appendChild(li1);
	ul.appendChild(li2);

## React.Dom
	là cầu nối giữa React , Dom
	const root = document.getElementByID("root");
	ReactDom.render(element,container, callback);

	Phiên bản 18
	const container = document.getElementByID("root");
	const root = ReactDom.createRoot(container);
	root.render(item);

## NPMJS , UNPKG
	NPMJS là mã nguồn mà react công bố nhưng thư viện
	UNPKG tải mã nguồn cụ thể của các thư viện 
	

## JSX
	Do mỗi khi cần tạo một element thì cần phải sử dụng React.createElement => dùng JSX
	Muốn dụng JS trong JSX => sử dụng {}

	<React.Fragment></React.Fragment> => kh sinh ra thẻ nào khác (dùng để bọc các thẻ)

## React element types
	function Header(){}
	<Header></Header>

	React.createElement(Header);

## Props
	React Components ( chỉ function )
		- đối số của hàm 
		- key -> đặc biệt (ko phải là một props)
	React element ( giống html )
		- class -> className
		- for -> htmlFor
		- key -> đặc biệt (ko phải là một props)

	alt + shift + S format lại code

## Components
	Nên truyền tham số cho callback ở tần render ra giao diện người dùng
	function Test({course, onClick}){
		return <>
			<h1 onClick = {()=> onClick(course)}> </h1>
		</>
	}
###
	const Form = {
		Input(){ return <input/> },
		Checkbox(){ return <input type="checkbox"/>
	}

	function App(){
		var type = "Checkbox"
		var Component = Form[type]
		
		return (
			<div>
				<Form.Input/>
				<Component/>
			</div>

		)
	}

### 
	Boolean, Null, Undefined -> không được render

	isCheck && <h1>...</h1> -> trả về h1 nếu ischeck đúng

### 
	Function Input({label, ...inputProps}){
		return 
			<input {...inputProps} />
	
	}
	

## Hooks

### useState
	- Chuyển trạng thái của dữ liệu
	- Cú pháp const [state, useState] = useState(initValue);

#### Cách hoạt động
	- Component sẽ được re-render lại khi setState
	- initValue chỉ dùng cho lần đầu
	- Sử dụng callBack với state
		khi gọi useState(state+1);
				useState(state+1);
				useState(state+1);
				=> chỉ tăng state lên 1 lần
		Khi gọi useState(prev => prev+1);
				useState(prev => prev+1);
				useState(prev => prev+1);
				=> tăng lên 3 lần
	- initValue với callback (dữ liệu trả về từ callback => làm initValue)
	- khi set state sẽ thay đổi thành state mới

	- Mount: là thời điểm component được thêm vào ReactElement để sử dụng
	- Unmount ngược lại
		
### useEffect
	- useEffect(callback, [deps])
	----- Chung
	- 1: Callback luôn được gọi sau khi component mounted
	- 2: Cleanup Function luôn được gọi trc khi component unmounted
	- 3: Cleanup Function luôn được gọi trước khi callback được gọi (trừ mounted)
	----- Riêng
	1: useEffect(callback)
		- Gọi callback mỗi khi component được re-render
		- Gọi callback sau khi component thêm element vào DOM rồi

	2: useEffect(callback, [])
		- Chỉ gọi một lần khi component mounted
		- thường sử dụng với listen dom event

		useEffect(() => { 
			const handScroll = () => {
 			
				if (window.scrolly >= 200) {
					setShowGoToTop(đúng) // liên tục set true thì vẫn k rerender lại vì thực hiện so sánh === nếu khác thì ms render lại
				} 
				else {
					setShowGoToTop(sai)
				}
			}

			window.addEventListener('scroll', handScroll)
		[])

		// Vấn đề khi component được mount thì sẽ add sự kiện scroll nhưng khi component unmount thì ở sự kiện ngoài vẫn đang tồn tại sự kiện scroll cái mà mình sẽ không thể sử dụng lại 
		=> clean up function


	3. useEffect(callback, [deps])
		- Callback sẽ đc gọi lại mỗi khi deps thay đổi


	4. Cleanup Function
		useEffect(() => {
			return () =>{
				window.removeEventListenter...
			}
		})



	5. SetInterval ( sử dụng CleanUp Function => tránh memory leak)
		useEffect( () =>{
			SetInterval((pre => pre -1));
		}, [])

		useEffect(() =>{
			setTimeout(() => {
				setCountDown(countDown -1)
			}, 1000)
		}, [countDown])

	6.
### useLayoutEffect
	1. Cập nhật lại state
	2. Cập nhật lại DOM (mutated)
	3. Gọi cleanup nếu deps thay đổi (sync)
	4. Gọi useLayoutEffect callback (sync)
	5. Render lại UI
### useRef
	- Lưu giá trị qua một tham chiếu bên ngoài
	- const ref = useRef(99) => luôn trả về object ((initvalue) chỉ hiện lần đầu)
		ref.current = 99;

	- Get ref 
		const h1Ref = useRef();
			// h1Ref sẽ như querySelector
		<h1 ref={h1Ref}> </h1>
### useCallBack
	- memo -> higher order component(HOC) -> ôm component
		- Dùng để wrap component => export default memo(App)
		- Tránh rerender không cần thiết
		VD: TRường hợp dùng state trong component cha thì sẽ tự động rerender component con
			=> sử dụng memo để tránh rerender không cần thiết
			=> memo(Content)
			=> Sẽ kiểm tra xem các props có thay đổi không => nếu không thì ko rerender lại => sử dụng "==="
	- useCallBack()
		- Tránh tạo ra các hàm mới một cách không cần thiết
		VD: 
			function App(){
				const handleIncrease = () => { setState(...)}
				return 
				<>
					<Content onIncrease = {handleIncrease}/>
				</>
			}

			=> do mỗi lần setState nó lại rerender lại và tạo ra một handleIncrease mới (Tham chiếu) 
			=> memo(Content) => sẽ so sánh === và thấy onIncrease thay đổi nên quyết định rerender

		- Cách hoạt động useCallBack(() => {}, [dependency])
			- Nếu ko có dependency => nó sẽ lưu tham triếu ra bên ngoài và trả về tham chiếu cũ thay vì tạo ra tham chiếu mới
			- Nếu có dependency, thì nếu dependency sau mỗi lần rerender thay đổi thì nó cx sẽ rerender và tạo ra tham chiếu mới

		- useCallBack luôn đi kèm với memo
### useMemo
	- Tránh thực hiện lại một logic không cần thiết 
	- useMemo(callback, []) 
		+ Nếu k truyền deps thì chỉ thực hiện tính toán 1 lần
		+ Nếu truyền thì thực hiện tính toán khi deps thay đổi
### useReducer
	- Cách sử dụng giống useState 
	- Khi nào nên sử dụng:
		- useState 
			-> sử dụng cho kiểu dữ liệu đơn giản
			-> Bước tư duy:	
				1. initState
				2. Action
		- useReducer 
			-> sử dụng khi state phức tạp hơn
			-> Khi có nhiều state 
			-> Bước tư duy
				1. initState
				2. Action
				3. Reducer
				4. Dispatch

			VD:
				const initState = 0
				const UP_ACTION = 'up'
				const DOWN_ACTION = 'down'
				const reducer = (state, action) =>{
					switch(action){
						case UP_ACTION:
							return state+1;
						case DOWN_ACTION:
							return state-1;
						default:
							throw new Error('invalid');
					}
				}

				4. Dispatch
				const [count, dispatch] = useReducer(reducer, initState);

				<button onClick => () => dispatch(UP_ACTION) />

				- Nguyên lý hoạt động:
					-> đầu tiền nó sẽ trả ra 1 mảng gồm [count, dispatch]
					-> count ban đầu sẽ ứng với initState
					-> dispatch dùng để kích hoạt một action
					-> reducer vẫn chưa được gọi ngay 

					-> khi gọi dispatch -> sẽ gọi hàm reducer và truyền vào giá trị count hiện tại, và tham số t2 là truyền giá trị truyền vào của dispatch
					-> sau khi thay đổi thì rerender lại component

					-> mang theo dữ liệu
						dispatch(setJob(payload))
						- setJob là một hàm với dữ liệu đầu vào là payload
					-> Có thể tách các thành phần ra
						
### useContext
	- Giúp truyền component xuống component con mà k cần props
	- Comp A => CompB => CompC

	- 3 Bước:
		- 1: Create Context
			Tạo một phạm vi để truyền dữ liệu 
		- 2: Provider
			Dùng để đưa dữ liệu
		- 3: Consumer
			Dùng để nhận dữ liệu

		VD: {createContext} from 'react'
			- Trả về 1 object có 2 phương thức Provider, Comsumer

			return <ThemeContext.Provider value = {value}>
				<Content/>
			</ThemeContext.Provider>

			- Để nhận được dữ liệu cần lấy đúm context mà đã gửi dữ liệu

			Trong file Content
				const value = useContext(ThemeContext);

				function ThemeProvider({children}){

				};

				Trong hàm muốn dùng <ThemeProvider>{children}</ThemeProvider>

		* Global State
			1. Tạo Context => Context.js
			2. Tạo Provider để wrap toàn bộ component
				const initState = {
					todos: [],
					todoInput: '',
				}

				function reducer(state, action){
					switch(action.type){
						...
					}
				}

				function Provider({children}){
					const [state, dispatch] = useProducer(reducer, initState)
					return (
						<Context.Provider value = { [state, dispatch] }>
							{children}
						<Context.Provider/>
					)
				}
				
### useImperativeHandle
	vấn đề khi sử dụng ref
		Muốn chạy một video 

		var videoRef = useRef();
			<Video ref = {videoRef} />
			<button value="play"/>
			<button value="pause"/>

	=> Lỗi vì function component không có ref
	=> Sử dung higher compoentn để chuyển tiếp ref
		Giải pháp sử dụng export default forwardRef(Video)
		khi đó goi <Video ref = {videoRef}> thực chất là đang gọi forwardRef()
		Khi đó nó rẽ truyền ref vào forwardRef => forwardRef sẽ truyền cho Video với tham số t2
		function Video(props, ref)

	=> vấn đề là chỉ sử dụng 2 thuộc tính play và pause và public toàn bộ videoRef ra thì rất nguy hiểm
	giống tính đóng gói của HDT

	=> Sử dụng useImperativeHandle(ref, () =>{
		play() {
			videoRef.current.Play()
		}
		pause(){
			videoRef.current.Pause()
		}
	})

	ref là cái mà useRef truyền từ màn tra xuống thông qua forwardRef
	callBack đằng sau thì là dữ liệu của ref của component cha
### useDebugValue


# Bất đồng bộ
	+ Callback
		truyền func vào làm tham số của hàm
	+ Promises
		Giải quyết vấn đề callback hell

		+ Là một lời hứa 
			+ Có thể thực hiện
			+ Không thể thực hiện
		+ 3 trạng thái:
			+ Pending ( chưa có kết quả trả về )
			+ Fulfilled ( nếu thành công )
			+ Rejected ( nếu thất bại )
		+ Cách sử dụng
			const currentPromise = new Promise( (resolve, reject) => {
				let condition = true
				if(condition){
					setTimeOut(() => {
						resolve("Success")
					}, 3000)
				}
				else{
					reject("error");
				}
			})

			currentPromise
			.then((data) =>{
				console.log(data) // Success

				return promise
			})
			.then(data =>{
				...
			})
			.catch(err =>{
				console.log(err) // error
			})
	+ Async await
		Không được nằm ở global
		Chỉ nằm trong hàm

		const demo = async() =>{
			var response = await promiseName
			...
		}


	+ Event Loop, Web Apis, Micro task Queue

		+ WebApis: 
			fetch , setTimeout, URL, localStorage, ...
			document, indexedDb, XMLHttpRequest
			callback

			Cách hoạt động:
				navigator.geolocation.getCurrentPosition(position => console.log(position), error => console.log(error));

				Đầu tiên thì ở call stack: thực thi getCurrentPosition luôn
				sau đó khi mà được allow thì callback thành công sẽ được đẩy đến Task Queue
				Event Loop: Có tác dụng kiểm tra xem liệu call stack đang trống hay không 
					+ trống => đẩy callback từ task queue vào
					+ không => giữ lại chưa đẩy vào

				setTimeout thời gian là delay việc đẩy vào task queuee chứ kp delay để đưa vào callstack
		+ Promise: được thực thi ngay khi tạo
			+ Pending ( chưa có kết quả trả về )
			+ Fulfilled ( nếu thành công )
			+ Rejected ( nếu thất bại )

			=> trả về giá trị qua resolve reject

			new Promise((resolve, reject) => {
				resovlve("done!");
			})
			.then(result => console.log(result)) => // sẽ chuyển callback này vào promisefullfillreaction (nhận promise result là tham số) => thêm vào microtask queue
