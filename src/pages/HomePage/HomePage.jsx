import React from 'react'
import TypeProduct from '../../components/TypeProduct/TypeProduct'
import { WrapperButtonMore, WrapperTypeFeatured, WrapperTypeProduct } from './style'
import SliderComponent from '../../components/SliderComponent/SliderComponent'
import slider1 from '../../assets/images/slider1.jpg'
import slider2 from '../../assets/images/slider2.jpg'
import slider3 from '../../assets/images/slider3.jpg'
import CardComponent from '../../components/CardComponent/CardComponent'
import { WrapperProducts } from '../TypeProductPage/style'
import { useQuery } from '@tanstack/react-query'
import * as ProductService from '../../services/ProductService'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect } from 'react'
import { useRef } from 'react'
import { useState } from 'react'
import Loading from '../../components/LoadingComponent/LoadingComponent'
import { useDebounce } from '../../hooks/useDebounce'
import { useDebounceArray } from '../../hooks/useDebounceArray'
// import NavbarComponent from '../../components/NavbarComponent/NavbarComponent'
// import ButtonComponent from '../../components/ButtonComponent/ButtonComponent'

const HomePage = () => {
  const searchProduct = useSelector((state) => state?.product?.search)
  const isImage = useSelector((state) => state?.product?.isImage)
  const productImgs = useSelector((state) => state?.product?.productImgs)
  const dispatch = useDispatch()

  const searchDebounce = useDebounce(searchProduct, 200)
  const searchImageDebounce = useDebounceArray(productImgs, 200)

  const refSearch = useRef()
  const [loading, setLoading] = useState(false)
  const [stateProducts, setStateProducts] = useState([])
  const [typeProducts, setTypeProducts] = useState([])
  const [limit, setLimit] = useState(8)

  const fetchProductAll = async (context) => {
    console.log('context', context)
    const limit = context?.queryKey && context?.queryKey[1]
    const search = context?.queryKey && context?.queryKey[2]
    const ids = context?.queryKey && context?.queryKey[3]
    if (isImage) {

      const res = await ProductService.getAllProductImage(ids, limit)
      return res
    }
    else {
      const res = await ProductService.getAllProduct(search, limit)
      return res
    }

  }
  const fetchAllTypeProduct = async () => {
    const res = await ProductService.getAllTypeProduct()
    if (res?.status === 'OK') {
      setTypeProducts(res?.data)
    }
  }
  const sumArray = (mang) => {
    let sum = 0;
    mang.forEach(function (value) {
      sum += value.countInStock;
    });
    console.log(sum)
    return sum;
  }
  const { isLoading, data: products, isPreviousData } = useQuery({ queryKey: ['products', limit, searchDebounce, searchImageDebounce], queryFn: fetchProductAll, retry: 3, retryDelay: 1000, keepPreviousData: true })
  // console.log('data', products?.data[0].sizes[0].countInStock)
  useEffect(() => {
    fetchAllTypeProduct()
  }, [])


  return (
    <>
      <Loading isLoading={isLoading || loading}>
        <div style={{ width: '100', margin: '0 auto', backgroundColor: '#000000', marginBottom: "30px" }}>
          <WrapperTypeProduct>
            {typeProducts.map((item) => {
              return (
                <TypeProduct name={item} key={item} />
              )
            })}
          </WrapperTypeProduct>
        </div>
        <div className='body' style={{ width: '100%', backgroundColor: '#ffff', }}>
          <div id="container" style={{ height: '100%', width: '100%', margin: '0 auto' }}>
            <SliderComponent arrImages={[slider1, slider2, slider3]} />
          </div>
          <div style={{ width: '100%', height: "70px", margin: '0 auto', backgroundColor: '#000000', marginBottom: "30px", marginTop: "40px" }}>
            <WrapperTypeFeatured>FEATURED PRODUCTS</WrapperTypeFeatured>
          </div>
          <div id="container" style={{ height: '100%', width: '1050px', margin: '0 auto' }}>

            <WrapperProducts>
              {products?.data?.map((product) => {
                return (
                  <CardComponent
                    key={product._id}
                    countInStock={sumArray(product.sizes)}
                    description={product.description}
                    images={product.images}
                    name={product.name}
                    rating={product.rating}
                    price={product.price}
                    type={product.type}
                    selled={product.selled}
                    discount={product.discount}
                    id={product._id}
                  />
                )
              })}
            </WrapperProducts>


            <div style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
              {
                !(products?.total === products?.data?.length || products?.totalPage === 1) && <WrapperButtonMore
                  textbutton={isPreviousData ? 'Load more' : "Xem thêm"} type="outline" styleButton={{
                    border: '1px solid #000000', color: `${products?.total === products?.data?.length ? '#ccc' : '#000000'}`,
                    width: '240px', height: '38px', borderRadius: '4px'
                  }}
                  styleTextButton={{ fontWeight: 500, color: products?.total === products?.data?.length && '#fff' }}
                  onClick={() => setLimit((prev) => prev + 4)}
                />
              }
            </div>

          </div>
        </div>
      </Loading>

    </>

  )
}

export default HomePage