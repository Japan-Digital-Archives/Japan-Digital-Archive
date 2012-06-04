<?php

namespace JDA\CoreBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;

class AdvSearchController extends Controller
{
    
    public function indexAction()
    {
    
    	$locale=$this->get('session')->getLocale();
		return $this->render('JDACoreBundle:AdvSearch:advsearch.html.twig', array(
					// last displayname entered by the user
					'page'=> 'search',
				));
    }
}
