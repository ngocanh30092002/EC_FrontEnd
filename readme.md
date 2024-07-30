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
### useLayoutEffect
### useRef
### useCallBack
### useMemo
### useReducer
### useContext
### useImperativeHandle
### useDebugValue


