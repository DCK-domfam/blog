//axios 인스턴스
//이렇게 axios 인스턴스를 만들면 나중에 API 클라이언트에 공통된 설정을 쉽게 넣어 줄수 있다.
//
import axios from 'axios';

const client = axios.create();

/**
 * 글로벌 설정 예시:
 * //API 주소를 다른 곳으로 사용함
 * client.defaults.baseURL = 'https://external-api-server.com/'
 *
 * //헤더설정
 * client.default.headers.common['Authorization'] = 'Bearer a1b2c3d4';
 *
 * //인터셉터 설정
 * axiod.intercepter.response.use(\
 *   response => {
 *     // 요청 성공 시 특정 작업 수행
 *     return response;
 *   },
 *   error => {
 *     // 요청 실패 시 특정 작업 수행
 *     return Promise.reject(error);
 *   }
 * })
 */

 export default client;
