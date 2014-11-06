<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class HomeController extends Controller
{
    
    
    
    public function redirectAction(){
    	
  	
		return $this->redirect($this->generateUrl('home',array(),true),302);
    		
    }
    
    public function indexAction()
    {
    	$locale = $this->getRequest()->getLocale();
        $this->get('session')->set('_locale', $locale);

    	//If search query posted, redirect to search page and pass search query as url hash
    	$user = $this->get('security.context')->getToken()->getUser();
    	
    	if(is_object($user)){
    		$displayName = $user->getDisplayName();
    		$userId = $user->getId();
    	}
    	else{
    		$displayName='none';
    		$userId=0;	
    	}
		
		
		$response = json_decode(file_get_contents("http://api.jdarchive.org/api/items/search?&type=Collection&sort=date-desc&published=1&thumbnail_url%3C%3E%22%22&limit=50"));
		$request = $response["request"]
		$items = $request["items"]
    	
    	$request = $this->getRequest();
    	if($request->request->get('search-text')) return $this->redirect(sprintf('%s#%s', $this->generateUrl('search'), 'text='.$request->request->get('search-text')));
   
    	return $this->render('JDACoreBundle:Home:home.html.twig', array(
					// last displayname entered by the user
					'page'=> 'home',
					'displayname'=>$displayName,
					'userId'=>$userId,
					'items'=>$items,
				));
    
    }
}
