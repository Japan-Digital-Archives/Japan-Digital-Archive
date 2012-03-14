<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class SearchController extends Controller
{
    
    public function indexAction($query=NULL)
    {
    
    	$locale=$this->get('session')->getLocale();
    	$request = $this->getRequest();
	 	$query=$request->query->get('query');
    	return $this->render('JDACoreBundle:Search:search.html.twig', array(
					// last displayname entered by the user
					'locale' => $locale,
					'page'=> 'search',
					'query'=>$query
					
				));
    }
}
